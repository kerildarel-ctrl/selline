import { useState, useEffect } from 'react'; import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'; import { timeAgo } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function Messages() {
  const [convs, setConvs] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { api.conversations().then(setConvs).catch(()=>{}).finally(()=>setLoading(false)) }, [])
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>💬 Messages</h1>
        {convs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <p>Aucune conversation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {convs.map(c => (
              <Link key={c.id} to={`/messages/${c.id}`}>
                <div style={{ padding: '14px 18px', borderRadius: 14, background: c.unread ? 'rgba(250,204,21,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${c.unread ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', gap: 14, alignItems: 'center', transition: 'all .2s' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(250,204,21,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {c.otherUser?.firstName?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{c.otherUser?.firstName} {c.otherUser?.lastName}</p>
                      <p style={{ fontSize: 11, color: '#475569' }}>{timeAgo(c.updatedAt)}</p>
                    </div>
                    {c.product && <p style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>Re: {c.product.name}</p>}
                    <p style={{ fontSize: 13, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage || '...'}</p>
                  </div>
                  {c.unread > 0 && <span style={{ background: '#facc15', color: '#0f172a', fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.unread}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
