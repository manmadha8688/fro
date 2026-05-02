/**
 * mock — demo data, no Google.
 * browser — Google Identity Services + Drive API in the browser (needs VITE_GOOGLE_CLIENT_ID only; no client secret).
 * backend — Django session + server-side OAuth (needs server env vars).
 */
export function getAuthMode() {
  if (import.meta.env.VITE_USE_MOCK !== 'false') return 'mock'
  if (import.meta.env.VITE_GOOGLE_CLIENT_ID) return 'browser'
  return 'backend'
}
