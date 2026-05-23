'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/api/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function ChatWidget() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, open])

  async function send(content: string) {
    const text = content.trim()
    if (!text || busy) return
    setInput('')
    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setBusy(true)
    try {
      const { reply } = await api.chat(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: "Sorry, I can't connect right now. Try again in a moment or call 1300 BLUVEN.",
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  return (
    <div className={`bv-chat ${open ? 'open' : ''}`}>
      {!open && (
        <button className="bv-chat-fab" aria-label="Chat with us" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="bv-chat-badge">AI</span>
        </button>
      )}

      <div className={`bv-chat-panel ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="bv-chat-head">
          <div className="bv-chat-head-l">
            <div className="bv-chat-avatar">
              <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
              </svg>
            </div>
            <div>
              <div className="bv-chat-title">{t('chat.title')}</div>
              <div className="bv-chat-status"><span className="bv-pulse"></span> <span>{t('chat.status')}</span></div>
            </div>
          </div>
          <button className="bv-chat-close" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>

        <div className="bv-chat-body" ref={bodyRef}>
          <div className="bv-chat-msg ai">
            <div className="bv-chat-bubble" dangerouslySetInnerHTML={{ __html: t('chat.welcome') }} />
          </div>

          {messages.length === 0 && (
            <div className="bv-chat-quick">
              <button onClick={() => send(t('chat.q1q'))}>{t('chat.q1')}</button>
              <button onClick={() => send(t('chat.q2q'))}>{t('chat.q2')}</button>
              <button onClick={() => send(t('chat.q3q'))}>{t('chat.q3')}</button>
              <button onClick={() => send(t('chat.q4q'))}>{t('chat.q4')}</button>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`bv-chat-msg ${m.role === 'assistant' ? 'ai' : 'me'}`}>
              <div className="bv-chat-bubble">{m.content}</div>
            </div>
          ))}

          {busy && (
            <div className="bv-chat-msg ai">
              <div className="bv-chat-bubble"><span className="bv-typing"><span/><span/><span/></span></div>
            </div>
          )}
        </div>

        <form className="bv-chat-form" onSubmit={onSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            autoComplete="off"
            disabled={busy}
          />
          <button type="submit" aria-label="Send" disabled={busy || !input.trim()}>
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </form>

        <div className="bv-chat-foot">
          <span>{t('chat.foot')}</span> · <a href="/privacy">{t('footer.privacy')}</a>
        </div>
      </div>
    </div>
  )
}
