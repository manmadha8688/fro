import { useTheme } from '../context/ThemeContext'

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`btn btn-ghost theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle__icon" aria-hidden>
        {isDark ? '☀️' : '🌙'}
      </span>
      <span className="theme-toggle__label">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
