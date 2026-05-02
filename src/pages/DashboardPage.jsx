import { Link } from 'react-router-dom'
import { DocumentList } from '../components/DocumentList'
import { useWorkspace } from '../context/WorkspaceContext'
import { ROUTES } from '../utils/constants'

export function DashboardPage() {
  const { selectedFolder, documents, documentsLoading } = useWorkspace()

  return (
    <div className="page dashboard-page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Dashboard</h1>
          <p className="page__subtitle">
            Inspect indexed documents for your selected folder before chatting.
          </p>
        </div>
        <Link
          to={ROUTES.chat}
          className={`btn btn-primary ${!selectedFolder ? 'is-disabled-link' : ''}`}
          aria-disabled={!selectedFolder}
          onClick={(e) => {
            if (!selectedFolder) e.preventDefault()
          }}
        >
          Open chat
        </Link>
      </header>

      <section className="surface-elevated dashboard-card">
        <div className="dashboard-card__head">
          <h2 className="dashboard-card__title">Selected folder</h2>
        </div>
        <div className="dashboard-card__body">
          {selectedFolder ? (
            <p className="dashboard-folder-name">{selectedFolder.name}</p>
          ) : (
            <p className="muted">
              Use the sidebar folder picker to choose a Drive folder.
            </p>
          )}
        </div>
      </section>

      <section className="surface-elevated dashboard-card">
        <div className="dashboard-card__head">
          <h2 className="dashboard-card__title">Documents</h2>
        </div>
        <div className="dashboard-card__body dashboard-card__body--flush">
          <DocumentList documents={documents} loading={documentsLoading} />
        </div>
      </section>
    </div>
  )
}
