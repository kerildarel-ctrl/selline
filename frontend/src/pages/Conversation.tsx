import { useState, useEffect, useRef } from 'react'; import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'; import { useAuth } from '../context/AuthContext'; import { timeAgo } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function Conversation() {
  const { id } = useParams(); const { user } = useAuth(); const navigate = useNavigate()
  const [conv, setConv] = useState<any>(null); const [msgs, setMsgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true); const [text, setText] = useState(''); const [sending, setSending] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if(!id) return
    api.conversation(id).then(c => { setConv(c); setMsgs(c.messages || []) }).catch(() => navigate('/messages')).finally(() => setLoading(false))
  }, [id])

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!text.trim() || !id) return
    setSending(true)
    try {
      const m = await api.sendMessage(id, text.trim()); setMsgs(p => [...p, m]); setText('')
    } catch {}
    setSending(false)
  }

  if(loading) return <PageSpinner />
  if(!conv) return null
  const other = conv.otherUser

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#080c14' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(250,204,21,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#facc15' }}>
          {other?.firstName?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14 }}>{other?.firstName} {other?.lastName}</p>
          {conv.product && <p style={{ fontSize: 11, color: '#475569' }}>Re: {conv.product.name}</p>}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {msgs.map(m => {
          const mine = m.senderId === user?.id
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: mine ? '#facc15' : '#1a2234', color: mine ? '#0f172a' : '#e2e8f0', fontSize: 14, lineHeight: 1.5 }}>
                <p>{m.content}</p>
                <p style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>{timeAgo(m.createdAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottom} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={{ padding: '12px 16px', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 10, flexShrink: 0 }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Écrire un message…" className="input" style={{ flex: 1 }} autoFocus />
        <button className="btn btn-primary" type="submit" disabled={!text.trim() || sending}>→</button>
      </form>
    </div>
  )
}
