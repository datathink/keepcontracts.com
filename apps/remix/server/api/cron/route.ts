import { timingSafeEqual } from 'node:crypto';

import { jobsClient } from '@documenso/lib/jobs/client';
import { env } from '@documenso/lib/utils/env';
import { Hono } from 'hono';

import type { HonoEnv } from '../../router';

/**
 * KeepContracts: run all scheduled background jobs once.
 *
 * Called daily by Cloud Scheduler
 */
export const cronRoute = new Hono<HonoEnv>().post('/run', async (c) => {
  const secret = env('NEXT_PRIVATE_CRON_SECRET');

  if (!secret) {
    return c.text('Not found', 404);
  }

  if (!isAuthorized(c.req.header('authorization'), secret)) {
    return c.text('Unauthorized', 401);
  }

  const result = await jobsClient.runScheduledJobs();

  // A 5xx makes Cloud Scheduler retry; completed jobs are skipped on the retry.
  const hasFailedJobs = Object.values(result.jobs).includes('failed');

  return c.json(result, hasFailedJobs ? 500 : 200);
});

const isAuthorized = (header: string | undefined, secret: string) => {
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(header ?? '');

  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
