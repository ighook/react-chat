import { useRef, useState } from 'react'

const minSize = {
  width: 320,
  height: 360,
}

const initialMessages = [
  {
    id: 1,
    author: 'System',
    text: 'This chat session keeps its own messages and draft.',
    sentAt: 'Now',
  },
]

function ChatWindow({
  title,
  defaultPosition = { x: 24, y: 24 },
  defaultSize = { width: 420, height: 520 },
}) {
  const actionRef = useRef(null)
  const [position, setPosition] = useState(defaultPosition)
  const [size, setSize] = useState(defaultSize)
  const [messages, setMessages] = useState(initialMessages)
  const [messageText, setMessageText] = useState('')

  const startPointerAction = (event, type) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)

    actionRef.current = {
      type,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: position,
      startSize: size,
    }
  }

  const movePointerAction = (event) => {
    const action = actionRef.current

    if (!action) {
      return
    }

    const deltaX = event.clientX - action.startX
    const deltaY = event.clientY - action.startY

    if (action.type === 'move') {
      setPosition({
        x: Math.max(0, action.startPosition.x + deltaX),
        y: Math.max(0, action.startPosition.y + deltaY),
      })
      return
    }

    const nextSize = { ...action.startSize }
    const nextPosition = { ...action.startPosition }

    if (action.type.includes('e')) {
      nextSize.width = Math.max(minSize.width, action.startSize.width + deltaX)
    }

    if (action.type.includes('s')) {
      nextSize.height = Math.max(minSize.height, action.startSize.height + deltaY)
    }

    if (action.type.includes('w')) {
      const nextWidth = Math.max(minSize.width, action.startSize.width - deltaX)
      nextPosition.x = action.startPosition.x + action.startSize.width - nextWidth
      nextSize.width = nextWidth
    }

    if (action.type.includes('n')) {
      const nextHeight = Math.max(minSize.height, action.startSize.height - deltaY)
      nextPosition.y = action.startPosition.y + action.startSize.height - nextHeight
      nextSize.height = nextHeight
    }

    setPosition(nextPosition)
    setSize(nextSize)
  }

  const stopPointerAction = () => {
    actionRef.current = null
  }

  const sendMessage = (event) => {
    event.preventDefault()

    const trimmedMessage = messageText.trim()

    if (!trimmedMessage) {
      return
    }

    setMessages([
      ...messages,
      {
        id: crypto.randomUUID(),
        author: 'You',
        text: trimmedMessage,
        sentAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setMessageText('')
  }

  return (
    <section
      className="chat-window"
      aria-label={`${title} chat window`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onPointerMove={movePointerAction}
      onPointerUp={stopPointerAction}
      onPointerCancel={stopPointerAction}
    >
      <header
        className="chat-window-titlebar"
        onPointerDown={(event) => startPointerAction(event, 'move')}
      >
        <div>
          <p>Active room</p>
          <h2>{title}</h2>
        </div>
        <span className="chat-status">Online</span>
      </header>

      <div className="message-list" aria-live="polite">
        {messages.map((message) => (
          <article
            className={message.author === 'You' ? 'message own-message' : 'message'}
            key={message.id}
          >
            <div className="message-meta">
              <strong>{message.author}</strong>
              <span>{message.sentAt}</span>
            </div>
            <p>{message.text}</p>
          </article>
        ))}
      </div>

      <form className="message-form" onSubmit={sendMessage}>
        <label className="sr-only" htmlFor={`${title}-message-input`}>Message</label>
        <input
          id={`${title}-message-input`}
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>

      {['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'].map((handle) => (
        <span
          className={`resize-handle resize-${handle}`}
          aria-hidden="true"
          key={handle}
          onPointerDown={(event) => startPointerAction(event, handle)}
        />
      ))}
    </section>
  )
}

export default ChatWindow
