import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { useTrapFocus } from '../hooks/useTrapFocus'
import { Spinner } from './Spinner'

export function FolderPicker() {
  const {
    folders,
    foldersLoading,
    loadFolders,
    selectedFolder,
    selectFolder,
  } = useWorkspace()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  useTrapFocus(panelRef, open)

  useEffect(() => {
    if (folders.length === 0 && !foldersLoading) {
      loadFolders()
    }
  }, [folders.length, foldersLoading, loadFolders])

  const label = selectedFolder?.name ?? 'Choose folder'

  return (
    <div className="folder-picker">
      <button
        type="button"
        className="folder-picker__trigger btn btn-secondary"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="folder-picker__trigger-label">{label}</span>
        <span className="folder-picker__chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="folder-picker__backdrop"
            aria-label="Close folder picker"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            className="folder-picker__panel surface-elevated"
            role="dialog"
            aria-modal="true"
            aria-label="Select Drive folder"
          >
            <div className="folder-picker__head">
              <span>Folders</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => loadFolders()}
                disabled={foldersLoading}
              >
                Refresh
              </button>
            </div>
            <div className="folder-picker__body">
              {foldersLoading ? (
                <div className="folder-picker__loading">
                  <Spinner label="Loading folders" />
                </div>
              ) : (
                <ul className="folder-picker__list">
                  {folders.map((f) => {
                    const active = selectedFolder?.id === f.id
                    return (
                      <li key={f.id}>
                        <button
                          type="button"
                          className={`folder-picker__item ${active ? 'is-active' : ''}`}
                          onClick={async () => {
                            await selectFolder(f)
                            setOpen(false)
                          }}
                        >
                          <span className="folder-picker__item-icon" aria-hidden>
                            📁
                          </span>
                          <span className="folder-picker__item-name">{f.name}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
