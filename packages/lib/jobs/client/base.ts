import type { Context as HonoContext } from 'hono';

import type { JobDefinition, SimpleTriggerJobOptions } from './_internal/job';

// KeepContracts: result of runScheduledJobs(), keyed by job definition ID.
export type ScheduledJobsResult = {
  jobs: Record<string, 'completed' | 'skipped' | 'failed'>;
  retriedCount: number;
};

export abstract class BaseJobProvider {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async triggerJob(_options: SimpleTriggerJobOptions): Promise<void> {
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public defineJob<N extends string, T>(_job: JobDefinition<N, T>): void {
    throw new Error('Not implemented');
  }

  public getApiHandler(): (req: HonoContext) => Promise<Response | void> {
    throw new Error('Not implemented');
  }

  /**
   * Start the cron scheduler for any registered cron jobs.
   *
   * No-op for providers that handle cron scheduling externally (e.g. Inngest).
   * Must be called explicitly at application startup.
   */
  public startCron(): void {
    // No-op by default — providers override if needed.
  }

  /**
   * KeepContracts: run all cron jobs once, triggered by an external scheduler.
   * Only the local provider supports this.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async runScheduledJobs(): Promise<ScheduledJobsResult> {
    throw new Error('Not implemented');
  }
}
