import { Citations } from './Citations'

function renderInlineBold(text) {
  if (!text) return null
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/)
    if (m) {
      return (
        <strong key={i} className="chat-msg__strong">
          {m[1]}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const align = isUser ? 'chat-msg--user' : 'chat-msg--assistant'

  return (
    <article className={`chat-msg ${align}`} aria-label={isUser ? 'You' : 'Assistant'}>
      <div
        className={`chat-msg__bubble ${message.error ? 'chat-msg__bubble--error' : ''}`}
      >
        <div className="chat-msg__meta">{isUser ? 'You' : 'Assistant'}</div>
        <div className="chat-msg__content">{renderInlineBold(message.content)}</div>
        {!isUser && message.citations?.length ? (
          <Citations items={message.citations} />
        ) : null}
      </div>
    </article>
  )
}
