import { useEffect, useRef, useState } from 'react'
import { ChatMessage } from '../components/ChatMessage'
import { Spinner } from '../components/Spinner'
import { useWorkspace } from '../context/WorkspaceContext'

export function ChatPage() {
  const {
    messages,
    chatLoading,
    sendChat,
    clearChat,
    selectedFolder,
  } = useWorkspace()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, chatLoading])

  async function onSubmit(e) {
    e.preventDefault()
    const text = draft
    setDraft('')
    await sendChat(text)
  }

  return (
    <div className="page chat-page">
      <header className="chat-page__header">
        <div>
          <h1 className="page__title">Chat</h1>
          <p className="page__subtitle chat-page__subtitle">
            Grounded Q&amp;A over{' '}
            {selectedFolder ? (
              <strong>{selectedFolder.name}</strong>
            ) : (
              <span className="muted">no folder selected</span>
            )}
            .
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={clearChat}
          disabled={!messages.length && !chatLoading}
        >
          Clear chat
        </button>
      </header>

      <div className="chat-shell surface-elevated">
        <div className="guardrail" role="note">
          <span className="guardrail__icon" aria-hidden>
            ✶
          </span>
          <div>
            <strong>Grounded answers only.</strong> Responses use retrieved excerpts
            from your selected folder and include citations when available.
          </div>
        </div>

        <div className="chat-scroll">
          {messages.length === 0 && !chatLoading ? (
            <div className="chat-empty">
              <p className="chat-empty__title">Ask your documents anything</p>
              <p className="muted">
                Examples: “Summarize our incident checklist”, “What does the remote work
                policy say about stipends?”
              </p>
            </div>
          ) : (
            <div className="chat-stream">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {chatLoading ? (
                <div className="chat-loading">
                  <Spinner label="Generating answer" />
                  <span className="muted">Retrieving grounded answer…</span>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form className="chat-composer" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="chat-input">
            Message
          </label>
          <textarea
            id="chat-input"
            className="chat-input"
            rows={2}
            placeholder={
              selectedFolder
                ? 'Ask a question about your documents…'
                : 'Select a folder in the sidebar first…'
            }
            value={draft}
            disabled={!selectedFolder || chatLoading}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!chatLoading && selectedFolder && draft.trim()) {
                  onSubmit(e)
                }
              }
            }}
          />
          <button
            type="submit"
            className="btn btn-primary chat-send"
            disabled={!selectedFolder || chatLoading || !draft.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
