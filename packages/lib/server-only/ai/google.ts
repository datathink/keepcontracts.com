import { createVertex } from '@ai-sdk/google-vertex';

import { env } from '../../utils/env';

const serviceAccountJson = env('GOOGLE_VERTEX_SERVICE_ACCOUNT_JSON');

// Auth resolution order (handled by the SDK, see createVertex2 in
// @ai-sdk/google-vertex): an explicit apiKey wins if set; otherwise it uses
// googleAuthOptions.credentials if we provide them; otherwise it falls back to
// Application Default Credentials
export const vertex = createVertex({
  project: env('GOOGLE_VERTEX_PROJECT_ID'),
  location: env('GOOGLE_VERTEX_LOCATION') || 'global',
  apiKey: env('GOOGLE_VERTEX_API_KEY'),
  googleAuthOptions: serviceAccountJson ? { credentials: JSON.parse(serviceAccountJson) } : undefined,
});
