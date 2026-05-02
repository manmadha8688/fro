/* eslint-disable react-refresh/only-export-components -- paired Provider + hook */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    const t = timers.current.get(id)
    if (t) clearTimeout(t)
    timers.current.delete(id)
    setToasts((list) => list.filter((x) => x.id !== id))
  }, [])

  const pushToast = useCallback(
    (toast) => {
      const id = ++toastId
      const entry = {
        id,
        variant: toast.variant ?? 'info',
        title: toast.title,
        message: toast.message,
      }
      setToasts((list) => [...list, entry])
      const duration = toast.duration ?? 4200
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        )
      }
      return id
    },
    [dismiss],
  )

  const toast = useMemo(
    () => ({
      success: (message, title = 'Success') =>
        pushToast({ variant: 'success', title, message }),
      error: (message, title = 'Something went wrong') =>
        pushToast({ variant: 'error', title, message }),
      info: (message, title = 'Notice') =>
        pushToast({ variant: 'info', title, message }),
      dismiss,
    }),
    [pushToast, dismiss],
  )

  const value = useMemo(() => ({ toasts, toast }), [toasts, toast])

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
