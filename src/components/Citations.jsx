export function Citations({ items = [] }) {
  if (!items.length) return null

  return (
    <div className="citations">
      <div className="citations__heading">Sources</div>
      <ul className="citations__list">
        {items.map((c, i) => (
          <li key={`${c.document_id ?? c.title}-${i}`} className="citations__item">
            <span className="citations__badge" aria-hidden>
              {i + 1}
            </span>
            <div className="citations__text">
              <div className="citations__title">{c.title}</div>
              {c.snippet ? (
                <blockquote className="citations__snippet">{c.snippet}</blockquote>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
