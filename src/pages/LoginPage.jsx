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
          <>Sign in with Google</>
        )}
      </button>

      <p className="login-page__footnote">
        Answers are strictly based on selected documents. The assistant does not use
        the open web for responses.
      </p>

      
    </div>
  )
}
