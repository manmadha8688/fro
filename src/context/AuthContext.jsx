/* eslint-disable react-refresh/only-export-components -- paired Provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  fetchAuthMe,
  initiateGoogleAuth as initiateGoogleAuthApi,
  logoutAuth,
} from '../services/api'
import { listRootFolders } from '../services/googleDriveClient'
import {
  fetchGoogleUserInfo,
  loadGoogleIdentityScript,
  requestAccessToken,
  revokeGoogleToken,
} from '../services/googleIdentity'
import { getAuthMode } from '../utils/authMode'
import { STORAGE_KEYS } from '../utils/constants'
import { useToast } from './ToastContext'

const AuthContext = createContext(null)

const MOCK_USER = {
  email: 'you@company.com',
  name: 'Alex Rivera',
  picture: null,
}

const DRIVE_SCOPE =
  'https://www.googleapis.com/auth/drive.readonly openid email profile'

function isMockMode() {
  return import.meta.env.VITE_USE_MOCK !== 'false'
}

function readStoredBrowserToken() {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.googleAccessToken)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [googleAccessToken, setGoogleAccessToken] = useState(null)
  const [connectLoading, setConnectLoading] = useState(false)
  const mode = getAuthMode()
  const [bootstrapping, setBootstrapping] = useState(
    () => mode !== 'mock',
  )

  const isAuthenticated = Boolean(user)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (isMockMode()) {
        setBootstrapping(false)
        return
      }

      if (mode === 'browser') {
        const token = readStoredBrowserToken()
        if (!token) {
          setBootstrapping(false)
          return
        }
        try {
          const profile = await fetchGoogleUserInfo(token)
          try {
            await listRootFolders(token)
          } catch (driveErr) {
            const msg = String(driveErr?.message ?? '')
            if (msg.includes('insufficient authentication scopes')) {
              try {
                sessionStorage.removeItem(STORAGE_KEYS.googleAccessToken)
              } catch {
                /* ignore */
              }
              if (!cancelled) {
                setUser(null)
                setGoogleAccessToken(null)
              }
              return
            }
            /* Other Drive errors (e.g. network): keep token; folder load can retry. */
          }
          if (!cancelled && profile?.email) {
            setUser(profile)
            setGoogleAccessToken(token)
          }
        } catch {
          try {
            sessionStorage.removeItem(STORAGE_KEYS.googleAccessToken)
          } catch {
            /* ignore */
          }
          if (!cancelled) {
            setUser(null)
            setGoogleAccessToken(null)
          }
        } finally {
          if (!cancelled) setBootstrapping(false)
        }
        return
      }

      try {
        const data = await fetchAuthMe()
        if (!cancelled && data?.user?.email) setUser(data.user)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [mode])

  const connectGoogle = useCallback(async () => {
    setConnectLoading(true)
    try {
      if (isMockMode()) {
        const profile = MOCK_USER
        setUser(profile)
        toast.success('Google Drive connected.', 'Signed in')
        return
      }

      if (mode === 'browser') {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (!clientId) {
          toast.error('Add VITE_GOOGLE_CLIENT_ID in .env (OAuth Web client ID).')
          return
        }
        await loadGoogleIdentityScript()
        const token = await requestAccessToken(clientId, DRIVE_SCOPE, {
          prompt: 'consent select_account',
          requireDriveReadonly: true,
        })
        const profile = await fetchGoogleUserInfo(token)
        try {
          sessionStorage.setItem(STORAGE_KEYS.googleAccessToken, token)
        } catch {
          /* ignore */
        }
        setGoogleAccessToken(token)
        setUser(profile)
        toast.success('Google Drive connected.', 'Signed in')
        return
      }

      const data = await initiateGoogleAuthApi()
      if (data?.authorization_url) {
        window.location.href = data.authorization_url
        return
      }
      const profile = data?.user ?? MOCK_USER
      setUser(profile)
      toast.success('Google Drive connected.', 'Signed in')
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Could not start Google sign-in.'
      toast.error(msg, 'Connection failed')
      throw err
    } finally {
      setConnectLoading(false)
    }
  }, [toast, mode])

  const invalidateBrowserGoogleAuth = useCallback(
    (reason) => {
      if (mode !== 'browser') return
      revokeGoogleToken(googleAccessToken)
      try {
        sessionStorage.removeItem(STORAGE_KEYS.googleAccessToken)
      } catch {
        /* ignore */
      }
      setGoogleAccessToken(null)
      setUser(null)
      if (reason) toast.error(reason, 'Sign in again')
    },
    [mode, googleAccessToken, toast],
  )

  const logout = useCallback(async () => {
    if (mode === 'browser') {
      await revokeGoogleToken(googleAccessToken)
      try {
        sessionStorage.removeItem(STORAGE_KEYS.googleAccessToken)
      } catch {
        /* ignore */
      }
      setGoogleAccessToken(null)
    } else if (!isMockMode()) {
      try {
        await logoutAuth()
      } catch {
        /* still clear local state */
      }
    }
    setUser(null)
    toast.info('You have been signed out.')
  }, [toast, mode, googleAccessToken])

  const value = useMemo(
    () => ({
      user,
      googleAccessToken,
      authMode: mode,
      isAuthenticated,
      bootstrapping,
      connectLoading,
      connectGoogle,
      logout,
      invalidateBrowserGoogleAuth,
    }),
    [
      user,
      googleAccessToken,
      mode,
      isAuthenticated,
      bootstrapping,
      connectLoading,
      connectGoogle,
      logout,
      invalidateBrowserGoogleAuth,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
