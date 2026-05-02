export function Spinner({ label = 'Loading', size = 'md' }) {
  const dim = size === 'sm' ? 18 : size === 'lg' ? 36 : 24
  return (
    <span className="spinner-wrap" role="status" aria-live="polite">
      <span
        className="spinner"
        style={{ width: dim, height: dim }}
        aria-hidden
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  )
}
