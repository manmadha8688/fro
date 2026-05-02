/**
 * Load Google Identity Services (OAuth token client). No backend or client secret.
 */
let scriptPromise

export function loadGoogleIdentityScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('No window'))
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () =>
        reject(new Error('Failed to load Google Sign-In')),
      )
      return
    }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Google Sign-In'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

const DRIVE_READONLY = 'https://www.googleapis.com/auth/drive.readonly'

/**
 * @param {string} clientId
 * @param {string} scope space-separated
 * @param {{ prompt?: string, requireDriveReadonly?: boolean }} [options]
 */
export function requestAccessToken(clientId, scope, options = {}) {
  const {
    prompt = 'consent select_account',
    requireDriveReadonly = true,
  } = options

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Sign-In not loaded'))
      return
    }
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope,
        prompt,
        include_granted_scopes: true,
        callback: (resp) => {
          if (resp.access_token) {
            if (
              requireDriveReadonly &&
              scope.includes(DRIVE_READONLY) &&
              typeof window.google.accounts.oauth2.hasGrantedAllScopes === 'function'
            ) {
              const ok = window.google.accounts.oauth2.hasGrantedAllScopes(
                resp,
                DRIVE_READONLY,
              )
              if (!ok) {
                reject(
                  new Error(
                    'Drive access was not granted. In Google Cloud Console → OAuth consent screen → Scopes, add “Google Drive API …/auth/drive.readonly”. Then remove this app at myaccount.google.com/permissions and connect again.',
                  ),
                )
                return
              }
            }
            resolve(resp.access_token)
            return
          }
          const err = resp.error_description || resp.error || 'Sign-in was cancelled'
          reject(new Error(err))
        },
      })
      client.requestAccessToken()
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}

export async function fetchGoogleUserInfo(accessToken) {
  const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(t || `userinfo ${r.status}`)
  }
  const data = await r.json()
  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
  }
}

export async function revokeGoogleToken(accessToken) {
  if (!accessToken) return
  try {
    await fetch(
      `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
  } catch {
    /* ignore */
  }
}
