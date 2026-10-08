#!/usr/bin/env bash
#
# Step 6 — Create (or update) the Cloud Scheduler job that runs the app's
# scheduled background jobs once a day by calling POST /api/cron/run, in place
# of an in-process timer. This lets Cloud Run scale to zero between requests.

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

CRON_JOB="${SERVICE}-cron"
CRON_SECRET_NAME="${SECRET_PREFIX}-cron-secret"

secret_exists "$CRON_SECRET_NAME" || die "Secret '${CRON_SECRET_NAME}' not found — run 02-secrets.sh first."

if [[ -n "${WEBAPP_URL:-}" ]]; then
  BASE_URL="$WEBAPP_URL"
else
  BASE_URL="$(gcloud_q run services describe "$SERVICE" --region="$REGION" --format='value(status.url)')"
fi

CRON_SECRET="$(gcloud_q secrets versions access latest --secret="$CRON_SECRET_NAME")"

# The secret ends up in the Scheduler job's header config, visible to project
# members with cloudscheduler.jobs.get.
scheduler_args=(
  --location="$REGION"
  --schedule="$CRON_SCHEDULE"
  --time-zone="$CRON_TIME_ZONE"
  --uri="${BASE_URL}/api/cron/run"
  --http-method=POST
  --attempt-deadline=300s
  --max-retry-attempts=3
  --min-backoff=11m
)

if gcloud_q scheduler jobs describe "$CRON_JOB" --location="$REGION" >/dev/null 2>&1; then
  info "Updating Cloud Scheduler job '${CRON_JOB}' (${CRON_SCHEDULE} ${CRON_TIME_ZONE})..."
  gcloud_q scheduler jobs update http "$CRON_JOB" "${scheduler_args[@]}" \
    --update-headers="Authorization=Bearer ${CRON_SECRET}" >/dev/null
else
  info "Creating Cloud Scheduler job '${CRON_JOB}' (${CRON_SCHEDULE} ${CRON_TIME_ZONE})..."
  gcloud_q scheduler jobs create http "$CRON_JOB" "${scheduler_args[@]}" \
    --headers="Authorization=Bearer ${CRON_SECRET}" >/dev/null
fi

info "Scheduler ready. Run it now with:"
info "  gcloud --project=${PROJECT_ID} scheduler jobs run ${CRON_JOB} --location=${REGION}"
