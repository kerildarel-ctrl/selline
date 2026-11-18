import { useState, useEffect } from 'react'; import { useNavigate } from 'react-router-dom'
import { api } from '../api'; import { timeAgo } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function Notifications() {
  const [notifs, setNotifs] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => { api.notifications().then(setNotifs).catch(()=>{}).finally(()=>setLoading(false)) }, [])
  const markRead = async (id: string) => {
    try { await api.markNotificationRead(id); setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n)) } catch {}
  }
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>🔔 Notifications</h1>
        {notifs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔕</div>
            <p>Aucune notification pour l'instant.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifs.map(n => (
              <div key={n.id} onClick={() => { markRead(n.id); if(n.link) navigate(n.link) }}
                style={{ padding: '14px 18px', borderRadius: 12, cursor: n.link ? 'pointer' : 'default',
                  background: n.read ? 'rgba(255,255,255,0.03)' : 'rgba(250,204,21,0.06)',
                  border: `1px solid ${n.read ? 'rgba(255,255,255,0.07)' : 'rgba(250,204,21,0.15)'}`,
                  transition: 'all .2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.6, flex: 1 }}>{n.message}</p>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#facc15', flexShrink: 0, marginTop: 4 }} />}
                </div>
                <p style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
