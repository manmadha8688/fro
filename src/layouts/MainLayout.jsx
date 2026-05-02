import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FolderPicker } from '../components/FolderPicker'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useWorkspace } from '../context/WorkspaceContext'
import { ROUTES } from '../utils/constants'

export function MainLayout() {
  const { user, logout } = useAuth()
  const { selectedFolder } = useWorkspace()
  const navigate = useNavigate()

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden>
            ◆
          </span>
          <div>
            <div className="sidebar__title">Neutra</div>
            <div className="sidebar__subtitle">Doc-grounded answers</div>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Primary">
          <NavLink
            to={ROUTES.dashboard}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'is-active' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to={ROUTES.chat}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'is-active' : ''}`
            }
          >
            Chat
          </NavLink>
        </nav>

        <div className="sidebar__section">
          <div className="sidebar__section-label">Folder</div>
          <FolderPicker />
          {selectedFolder ? (
            <p className="sidebar__folder-hint">
              Answering from <strong>{selectedFolder.name}</strong>
            </p>
          ) : (
            <p className="sidebar__folder-hint sidebar__folder-hint--warn">
              Pick a folder to enable grounded answers.
            </p>
          )}
        </div>

        <div className="sidebar__spacer" />

        <div className="sidebar__account surface-muted">
          <div className="sidebar__account-label">Connected</div>
          <div className="sidebar__account-email">{user?.email}</div>
          <div className="sidebar__account-name">{user?.name}</div>
        </div>

        <div className="sidebar__footer">
          <ThemeToggle className="sidebar__theme" />
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={async () => {
              await logout()
              navigate(ROUTES.login, { replace: true })
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-area">
        <Outlet />
      </main>
    </div>
  )
}
