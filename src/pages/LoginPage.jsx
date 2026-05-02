import { useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Spinner } from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../utils/constants'

const OAUTH_ERROR_MESSAGES = {
  access_denied: 'Google sign-in was cancelled.',
  missing_code: 'OAuth did not return a code. Try again.',
  invalid_state: 'Security check failed. Try signing in again.',
  token_exchange: 'Could not complete sign-in. Check backend configuration.',
}

export function LoginPage() {
  const {
    authMode,
    isAuthenticated,
    bootstrapping,
    connectLoading,
    connectGoogle,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || ROUTES.dashboard

  const oauthError = useMemo(() => {
    const q = new URLSearchParams(location.search)
    const code = q.get('error')
    if (!code) return null
    return OAUTH_ERROR_MESSAGES[code] ?? `Sign-in error: ${code}`
  }, [location.search])

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, from, navigate])

  async function onConnect() {
    try {
      await connectGoogle()
    } catch {
      /* toast handled in auth */
    }
  }

  if (bootstrapping) {
    return (
      <div className="login-page login-page--center">
        <Spinner label="Checking session" size="lg" />
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-page__badge">Google Drive</div>
      <h1 className="login-page__title">Connect your workspace</h1>
      <p className="login-page__lead">
        Link Google Drive to browse folders and ask questions that stay grounded in
        your selected documents.
      </p>

      {oauthError ? (
        <p className="login-page__oauth-error" role="alert">
          {oauthError}
        </p>
      ) : null}

      <button
        type="button"
        className="btn btn-primary btn-lg login-page__cta"
        onClick={onConnect}
        disabled={connectLoading}
      >
        {connectLoading ? (
          <>
            <Spinner size="sm" label="Connecting" /> Connecting…
          </>
        ) : (
          <>Connect Google Drive</>
        )}
      </button>

      <p className="login-page__footnote">
        Answers are strictly based on selected documents. The assistant does not use
        the open web for responses.
      </p>

      {authMode === 'browser' ? (
        <div className="login-page__footnote login-page__footnote--dim login-page__setup">
          <p className="login-page__setup-title">Google Cloud setup</p>
          <p>
            Use an <strong>OAuth client type: Web application</strong> (not Desktop).
            In{' '}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
            >
              APIs &amp; Services → Credentials
            </a>
            , edit your Web client and add <strong>the same host you use in the address bar</strong>{' '}
            to <strong>both</strong> lists below (mismatch causes{' '}
            <code>redirect_uri_mismatch</code>).
          </p>
          <ul className="login-page__setup-list">
            <li>
              <strong>Enable Google Drive API:</strong>{' '}
              <a
                href="https://console.cloud.google.com/apis/library/drive.googleapis.com"
                target="_blank"
                rel="noreferrer"
              >
                Library → Google Drive API → Enable
              </a>
              {' '}
              for the same project as your OAuth client. Fixes “has not been used / disabled”; wait a
              few minutes after enabling.
            </li>
            <li>
              <strong>Authorized JavaScript origins:</strong>{' '}
              <code>http://localhost:5173</code> and, if you use it,{' '}
              <code>http://127.0.0.1:5173</code>
              . For production (e.g. Vercel), add your real site origin too, such as{' '}
              <code>https://your-app.vercel.app</code> (and your custom domain if you use one).
            </li>
            <li>
              <strong>Authorized redirect URIs:</strong> add the{' '}
              <em>same</em> URLs again (e.g. <code>http://localhost:5173</code> and{' '}
              <code>http://127.0.0.1:5173</code>). Save and wait a minute, then retry.
              Include your production origins here as well (Vercel URL / custom domain).
            </li>
            <li>
              <strong>OAuth consent screen → Scopes:</strong> add{' '}
              <code>…/auth/drive.readonly</code> (Google Drive API). Without it you get
              “insufficient authentication scopes”. Then at{' '}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
                Google Account → Third-party access
              </a>
              , remove this app and connect again so Google asks for Drive permission.
            </li>
          </ul>
          <p>
            Put the Web client ID in <code>.env.local</code> as{' '}
            <code>VITE_GOOGLE_CLIENT_ID</code>, then restart <code>npm run dev</code>.
          </p>
        </div>
      ) : null}
    </div>
  )
}
