import { useEffect } from 'react'

/**
 * Basic focus trap for small modals/dialogs (folder picker).
 */
export function useTrapFocus(containerRef, active) {
  useEffect(() => {
    if (!active || !containerRef.current) return
    const root = containerRef.current
    const focusable = root.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (first && typeof first.focus === 'function') first.focus()

    function onKeyDown(e) {
      if (e.key !== 'Tab') return
      if (focusable.length === 0) return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus?.()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first?.focus?.()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => root.removeEventListener('keydown', onKeyDown)
  }, [active, containerRef])
}
