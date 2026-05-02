/**
 * mock — demo data, no Google.
 * browser — Google Identity Services + Drive API in the browser (needs VITE_GOOGLE_CLIENT_ID only; no client secret).
 * backend — Django session + server-side OAuth (needs server env vars).
 */
export function getAuthMode() {
  const v = import.meta.env.VITE_USE_MOCK
  if (v == null || v === '') {
    if (!import.meta.env.PROD) return 'mock'
  } else if (v !== 'false') {
    return 'mock'
  }
  if (import.meta.env.VITE_GOOGLE_CLIENT_ID) return 'browser'
  return 'backend'
}
