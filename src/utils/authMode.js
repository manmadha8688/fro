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
  // In production we avoid backend session OAuth (would require a server-side session store / DB).
  // If client ID isn't provided, browser mode will surface a clear "set VITE_GOOGLE_CLIENT_ID" error.
  if (import.meta.env.PROD) return 'browser'
  return 'backend'
}
