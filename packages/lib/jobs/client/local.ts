import { prisma } from '@documenso/prisma';
import { sha256 } from '@noble/hashes/sha2';
import { BackgroundJobStatus, Prisma } from '@prisma/client';
import { CronExpressionParser } from 'cron-parser';
import type { Context as HonoContext } from 'hono';

import { NEXT_PRIVATE_INTERNAL_WEBAPP_URL } from '../../constants/app';
import { sign } from '../../server-only/crypto/sign';
import { verify } from '../../server-only/crypto/verify';
import { env } from '../../utils/env';
import {
  type JobDefinition,
  type JobRunIO,
  type SimpleTriggerJobOptions,
  ZSimpleTriggerJobOptionsSchema,
} from './_internal/job';
import type { Json } from './_internal/json';
import { BaseJobProvider, type ScheduledJobsResult } from './base';

/**
 * Build a deterministic BackgroundJob ID for a cron run so that multiple
 * instances of the local provider racing to enqueue the same slot will
 * collide on the primary key instead of creating duplicates.
 */
const createCronRunId = (jobId: string, scheduledFor: Date): string => {
  const key = `cron:${jobId}:${scheduledFor.toISOString()}`;
  const hash = Buffer.from(sha256(key)).toString('hex').slice(0, 24);

  return `cron_${hash}`;
};

type CronJobEntry = {
  definition: JobDefinition;
  cron: string;
  lastTickAt: Date;
};

const CRON_POLL_INTERVAL_MS = 30_000; // 30 seconds
const CRON_POLL_JITTER_MS = 5_000; // 0-5 seconds random offset

// KeepContracts: dropped-dispatch retry window for runScheduledJobs().
const STUCK_JOB_MIN_AGE_MS = 15 * 60 * 1000; // 15 minutes
const STUCK_JOB_MAX_AGE_MS = 48 * 60 * 60 * 1000; // 48 hours
const STUCK_JOB_BATCH_SIZE = 100;

export class LocalJobProvider extends BaseJobProvider {
  private static _instance: LocalJobProvider;

  private _jobDefinitions: Record<string, JobDefinition> = {};
  private _cronJobs: CronJobEntry[] = [];
  private _cronPoller: NodeJS.Timeout | null = null;

  private constructor() {
    super();
  }

  static getInstance() {
    if (!LocalJobProvider._instance) {
      LocalJobProvider._instance = new LocalJobProvider();
    }

    return LocalJobProvider._instance;
  }

  public defineJob<N extends string, T>(definition: JobDefinition<N, T>) {
    this._jobDefinitions[definition.id] = {
      ...definition,
      enabled: definition.enabled ?? true,
    };

    if (definition.trigger.cron && definition.enabled !== false) {
      const alreadyRegistered = this._cronJobs.some((job) => job.definition.id === definition.id);

      if (!alreadyRegistered) {
        this._cronJobs.push({
          definition: {
            ...definition,
            enabled: definition.enabled ?? true,
          },
          cron: definition.trigger.cron,
          lastTickAt: new Date(),
        });

        console.log(`[JOBS]: Registered cron job ${definition.id} (${definition.trigger.cron})`);
      }
    }
  }

  /**
   * Start the single cron poller for all registered cron jobs.
   *
   * Must be called explicitly at application startup after all jobs have been
   * defined. The poller runs every 30 seconds (+ random jitter to avoid
   * thundering herd across instances) and evaluates all registered cron jobs
   * for due slots.
   *
   * For each due slot it creates a BackgroundJob row with a deterministic ID.
   * If the insert succeeds the job is dispatched; if it fails with a unique
   * constraint violation (P2002) another instance already claimed that slot.
   */
  public override startCron() {
    if (this._cronPoller) {
      return;
    }

    if (this._cronJobs.length === 0) {
      return;
    }

    // KeepContracts: an external scheduler calls runScheduledJobs() instead.
    if (env('NEXT_PRIVATE_JOBS_EXTERNAL_CRON') === 'true') {
      console.log('[JOBS]: External cron enabled, skipping in-process cron poller');
      return;
    }

    const tick = () => {
      const jitter = Math.floor(Math.random() * CRON_POLL_JITTER_MS);

      this._cronPoller = setTimeout(() => {
        void this.processCronTick().finally(tick);
      }, CRON_POLL_INTERVAL_MS + jitter);
    };

    tick();

    console.log(`[JOBS]: Started cron poller for ${this._cronJobs.length} job(s)`);
  }

  private async processCronTick() {
    for (const cronJob of this._cronJobs) {
      try {
        const dueSlots = this.getDueCronSlots(cronJob);

        cronJob.lastTickAt = new Date();

        if (dueSlots.length === 0) {
          continue;
        }

        // Only take the latest slot — sweep-style jobs don't need to catch up
        // every missed slot after downtime, just the most recent one.
        const scheduledFor = dueSlots[dueSlots.length - 1];
        const deterministicId = createCronRunId(cronJob.definition.id, scheduledFor);

        const pendingJob = await prisma.backgroundJob
          .create({
            data: {
              id: deterministicId,
              jobId: cronJob.definition.id,
              name: cronJob.definition.name,
              version: cronJob.definition.version,
              payload: { scheduledFor: scheduledFor.toISOString() },
            },
          })
          .catch((error: unknown) => {
            // P2002 = unique constraint violation — another instance already enqueued this slot.
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
              return null;
            }

            throw error;
          });

        if (!pendingJob) {
          continue;
        }

        await this.submitJobToEndpoint({
          jobId: pendingJob.id,
          jobDefinitionId: pendingJob.jobId,
          data: {
            name: cronJob.definition.trigger.name,
            payload: { scheduledFor: scheduledFor.toISOString() },
          },
          isRetry: false,
        });
      } catch (error) {
        console.error(`[JOBS]: Cron tick failed for ${cronJob.definition.id}`, error);
      }
    }
  }

  /**
   * Use cron-parser to find all cron slots that are due between the last tick
   * and now.
   */
  private getDueCronSlots(cronJob: CronJobEntry): Date[] {
    const expr = CronExpressionParser.parse(cronJob.cron, {
      currentDate: cronJob.lastTickAt,
    });

    const now = new Date();
    const slots: Date[] = [];

    let next = expr.next();

    while (next.toDate() <= now) {
      slots.push(next.toDate());
      next = expr.next();
    }

    return slots;
  }

  /**
   * KeepContracts: run every registered cron job once, then re-dispatch recent
   * jobs whose dispatch was dropped. Called once a day by an external scheduler
   * (POST /api/cron/run) so Cloud Run doesn't need CPU between requests.
   *
   * Cron jobs run inline and are awaited. Each run's ID is keyed on the UTC
   * date, so a repeat call on the same day only re-runs jobs that failed.
   */
  public override async runScheduledJobs(): Promise<ScheduledJobsResult> {
    const results: ScheduledJobsResult['jobs'] = {};

    const today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);

    for (const cronJob of this._cronJobs) {
      const { definition } = cronJob;
      const jobId = createCronRunId(definition.id, today);
      const payload = { scheduledFor: today.toISOString() };

      await prisma.backgroundJob
        .create({
          data: {
            id: jobId,
            jobId: definition.id,
            name: definition.name,
            version: definition.version,
            payload,
          },
        })
        .catch((error: unknown) => {
          // P2002 = already created by an earlier call today.
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return null;
          }

          throw error;
        });

      // Claim the run. Completed or in-progress runs are left alone.
      const claimed = await prisma.backgroundJob.updateMany({
        where: {
          id: jobId,
          status: { in: [BackgroundJobStatus.PENDING, BackgroundJobStatus.FAILED] },
        },
        data: {
          status: BackgroundJobStatus.PROCESSING,
        },
      });

      if (claimed.count === 0) {
        results[definition.id] = 'skipped';
        continue;
      }

      try {
        console.log(`[JOBS]: Running scheduled job ${definition.id}`);

        await definition.handler({
          payload: definition.trigger.schema ? definition.trigger.schema.parse(payload) : payload,
          io: this.createJobRunIO(jobId),
        });

        await prisma.backgroundJob.update({
          where: { id: jobId },
          data: { status: BackgroundJobStatus.COMPLETED, completedAt: new Date() },
        });

        results[definition.id] = 'completed';
      } catch (error) {
        console.error(`[JOBS]: Scheduled job ${definition.id} failed`, error);

        await prisma.backgroundJob.update({
          where: { id: jobId },
          data: { status: BackgroundJobStatus.FAILED, completedAt: new Date() },
        });

        results[definition.id] = 'failed';
      }
    }

    const retriedCount = await this.retryStuckJobs();

    return { jobs: results, retriedCount };
  }

  /**
   * KeepContracts: re-dispatch jobs left PENDING because their fire-and-forget
   * dispatch was dropped. The job endpoint only claims PENDING rows, so a job that is
   * dispatched twice still runs once. Old rows are ignored so we never re-send
   * stale emails.
   */
  private async retryStuckJobs() {
    const now = Date.now();

    const stuckJobs = await prisma.backgroundJob.findMany({
      where: {
        status: BackgroundJobStatus.PENDING,
        submittedAt: { gte: new Date(now - STUCK_JOB_MAX_AGE_MS) },
        updatedAt: { lte: new Date(now - STUCK_JOB_MIN_AGE_MS) },
        retried: { lt: prisma.backgroundJob.fields.maxRetries },
      },
      orderBy: { submittedAt: 'asc' },
      take: STUCK_JOB_BATCH_SIZE,
    });

    const dispatchable = stuckJobs.filter((job) => this._jobDefinitions[job.jobId]);

    console.log(`[JOBS]: Re-dispatching ${dispatchable.length} stuck job(s)`);

    // Await each job to completion so this request keeps the instance's CPU allocated.
    await Promise.allSettled(
      dispatchable.map(async (job) =>
        this.submitJobToEndpoint({
          jobId: job.id,
          jobDefinitionId: job.jobId,
          data: {
            name: this._jobDefinitions[job.jobId].trigger.name,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            payload: job.payload as SimpleTriggerJobOptions['payload'],
          },
          isRetry: true,
          waitForCompletion: true,
        }),
      ),
    );

    return dispatchable.length;
  }

  public async triggerJob(options: SimpleTriggerJobOptions) {
    const eligibleJobs = Object.values(this._jobDefinitions).filter((job) => job.trigger.name === options.name);

    await Promise.all(
      eligibleJobs.map(async (job) => {
        // Ideally we will change this to a createMany with returning later once we upgrade Prisma
        // @see: https://github.com/prisma/prisma/releases/tag/5.14.0
        const pendingJob = await prisma.backgroundJob.create({
          data: {
            jobId: job.id,
            name: job.name,
            version: job.version,
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            payload: options.payload as Prisma.InputJsonValue,
          },
        });

        await this.submitJobToEndpoint({
          jobId: pendingJob.id,
          jobDefinitionId: pendingJob.jobId,
          data: options,
          isRetry: false,
        });
      }),
    );
  }

  public getApiHandler(): (c: HonoContext) => Promise<Response | void> {
    return async (c: HonoContext) => {
      const req = c.req;

      if (req.method !== 'POST') {
        return c.text('Method not allowed', 405);
      }

      const jobId = req.header('x-job-id');
      const signature = req.header('x-job-signature');
      const isRetry = req.header('x-job-retry') !== undefined;

      const options = await req
        .json()
        .then(async (data) => ZSimpleTriggerJobOptionsSchema.parseAsync(data))
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        .then((data) => data as SimpleTriggerJobOptions)
        .catch(() => null);

      if (!options) {
        return c.text('Bad request', 400);
      }

      const definition = this._jobDefinitions[options.name];

      if (typeof jobId !== 'string' || typeof signature !== 'string' || typeof options !== 'object') {
        return c.text('Bad request', 400);
      }

      if (!definition) {
        return c.text('Job not found', 404);
      }

      if (definition && !definition.enabled) {
        console.log('Attempted to trigger a disabled job', options.name);

        return c.text('Job not found', 404);
      }

      if (!signature || !verify(options, signature)) {
        return c.text('Unauthorized', 401);
      }

      let payload = options.payload;

      if (definition.trigger.schema) {
        const result = definition.trigger.schema.safeParse(payload);

        if (!result.success) {
          return c.text('Bad request', 400);
        }

        payload = result.data;
      }

      console.log(`[JOBS]: Triggering job ${options.name} with payload`, payload);

      let backgroundJob = await prisma.backgroundJob
        .update({
          where: {
            id: jobId,
            status: BackgroundJobStatus.PENDING,
          },
          data: {
            status: BackgroundJobStatus.PROCESSING,
            retried: {
              increment: isRetry ? 1 : 0,
            },
            lastRetriedAt: isRetry ? new Date() : undefined,
          },
        })
        .catch(() => null);

      if (!backgroundJob) {
        return c.text('Job not found', 404);
      }

      try {
        await definition.handler({
          payload,
          io: this.createJobRunIO(jobId),
        });

        backgroundJob = await prisma.backgroundJob.update({
          where: {
            id: jobId,
            status: BackgroundJobStatus.PROCESSING,
          },
          data: {
            status: BackgroundJobStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      } catch (error) {
        console.log(`[JOBS]: Job ${options.name} failed`, error);

        const taskHasExceededRetries = error instanceof BackgroundTaskExceededRetriesError;
        const jobHasExceededRetries =
          backgroundJob.retried >= backgroundJob.maxRetries && !(error instanceof BackgroundTaskFailedError);

        if (taskHasExceededRetries || jobHasExceededRetries) {
          backgroundJob = await prisma.backgroundJob.update({
            where: {
              id: jobId,
              status: BackgroundJobStatus.PROCESSING,
            },
            data: {
              status: BackgroundJobStatus.FAILED,
              completedAt: new Date(),
            },
          });

          return c.text('Task exceeded retries', 500);
        }

        backgroundJob = await prisma.backgroundJob.update({
          where: {
            id: jobId,
            status: BackgroundJobStatus.PROCESSING,
          },
          data: {
            status: BackgroundJobStatus.PENDING,
          },
        });

        await this.submitJobToEndpoint({
          jobId,
          jobDefinitionId: backgroundJob.jobId,
          data: options,
          isRetry: true,
        });
      }

      return c.text('OK', 200);
    };
  }

  private async submitJobToEndpoint(options: {
    jobId: string;
    jobDefinitionId: string;
    data: SimpleTriggerJobOptions;
    isRetry?: boolean;
    waitForCompletion?: boolean;
  }) {
    const { jobId, jobDefinitionId, data, isRetry, waitForCompletion } = options;

    const endpoint = `${NEXT_PRIVATE_INTERNAL_WEBAPP_URL()}/api/jobs/${jobDefinitionId}/${jobId}`;
    const signature = sign(data);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Job-Id': jobId,
      'X-Job-Signature': signature,
    };

    if (isRetry) {
      headers['X-Job-Retry'] = '1';
    }

    console.log('Submitting job to endpoint:', endpoint);

    if (waitForCompletion) {
      await fetch(endpoint, { method: 'POST', body: JSON.stringify(data), headers }).catch(() => null);
      return;
    }

    await Promise.race([
      fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers,
      }).catch(() => null),
      new Promise((resolve) => {
        setTimeout(resolve, 150);
      }),
    ]);
  }

  private createJobRunIO(jobId: string): JobRunIO {
    return {
      runTask: async <T extends void | Json>(cacheKey: string, callback: () => Promise<T>) => {
        const hashedKey = Buffer.from(sha256(cacheKey)).toString('hex');

        let task = await prisma.backgroundJobTask.findFirst({
          where: {
            id: `task-${hashedKey}--${jobId}`,
            jobId,
          },
        });

        if (!task) {
          task = await prisma.backgroundJobTask.create({
            data: {
              id: `task-${hashedKey}--${jobId}`,
              name: cacheKey,
              jobId,
              status: BackgroundJobStatus.PENDING,
            },
          });
        }

        if (task.status === BackgroundJobStatus.COMPLETED) {
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          return task.result as T;
        }

        if (task.retried >= 3) {
          throw new BackgroundTaskExceededRetriesError('Task exceeded retries');
        }

        try {
          const result = await callback();

          task = await prisma.backgroundJobTask.update({
            where: {
              id: task.id,
              jobId,
            },
            data: {
              status: BackgroundJobStatus.COMPLETED,
              result: result === null ? Prisma.JsonNull : result,
              completedAt: new Date(),
            },
          });

          return result;
        } catch (err) {
          task = await prisma.backgroundJobTask.update({
            where: {
              id: task.id,
              jobId,
            },
            data: {
              status: BackgroundJobStatus.PENDING,
              retried: {
                increment: 1,
              },
            },
          });

          console.log(`[JOBS:${task.id}] Task failed`, err);

          throw new BackgroundTaskFailedError('Task failed');
        }
      },
      triggerJob: async (_cacheKey, payload) => await this.triggerJob(payload),
      logger: {
        debug: (...args) => console.debug(`[${jobId}]`, ...args),
        error: (...args) => console.error(`[${jobId}]`, ...args),
        info: (...args) => console.info(`[${jobId}]`, ...args),
        log: (...args) => console.log(`[${jobId}]`, ...args),
        warn: (...args) => console.warn(`[${jobId}]`, ...args),
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      wait: async () => {
        throw new Error('Not implemented');
      },
    };
  }
}

class BackgroundTaskFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackgroundTaskFailedError';
  }
}

class BackgroundTaskExceededRetriesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackgroundTaskExceededRetriesError';
  }
}
