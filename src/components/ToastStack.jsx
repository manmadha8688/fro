import { useToast } from '../context/ToastContext'

export function ToastStack() {
  const { toasts, toast } = useToast()

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.variant}`}
          role="status"
        >
          <div className="toast__body">
            <strong className="toast__title">{t.title}</strong>
            {t.message ? <p className="toast__msg">{t.message}</p> : null}
          </div>
          <button
            type="button"
            className="toast__close"
            aria-label="Dismiss notification"
            onClick={() => toast.dismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
