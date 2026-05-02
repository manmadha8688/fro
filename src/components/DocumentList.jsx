function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function DocumentList({ documents = [], loading }) {
  if (loading) {
    return (
      <div className="doc-list doc-list--muted" aria-busy="true">
        Loading documents…
      </div>
    )
  }

  if (!documents.length) {
    return (
      <div className="doc-list doc-list--empty">
        No documents in this folder yet, or select a folder to load files.
      </div>
    )
  }

  return (
    <ul className="doc-list">
      {documents.map((doc) => (
        <li key={doc.id} className="doc-list__row">
          <div className="doc-list__icon" aria-hidden>
            📄
          </div>
          <div className="doc-list__main">
            <div className="doc-list__name">{doc.name}</div>
            <div className="doc-list__meta">
              {formatDate(doc.modifiedTime)}
              {doc.mimeType ? (
                <span className="doc-list__mime">{doc.mimeType}</span>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
