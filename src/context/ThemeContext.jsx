/* eslint-disable react-refresh/only-export-components -- paired Provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { STORAGE_KEYS } from '../utils/constants'

const ThemeContext = createContext(null)

function readStoredTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEYS.theme)
  if (stored === 'dark' || stored === 'light') return stored
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches)
    return 'dark'
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEYS.theme, theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState((prev) => (typeof next === 'function' ? next(prev) : next))
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
