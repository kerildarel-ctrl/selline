import { useState, useEffect } from 'react'
import { api } from '../api'; import { fmtDate } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [q, setQ] = useState('')
  useEffect(() => { load() }, [])
  const load = (search?: string) => { setLoading(true); api.adminUsers(search).then(setUsers).catch(() => {}).finally(() => setLoading(false)) }
  const toggleBlock = async (id: string, blocked: boolean) => {
    try { await api.adminBlockUser(id, !blocked); setUsers(u => u.map(x => x.id === id ? { ...x, blocked: !blocked } : x)) } catch {}
  }
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>👥 Utilisateurs</h1>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher…" style={{ flex: 1, maxWidth: 300 }} onKeyDown={e => e.key==='Enter' && load(q)} />
          <button className="btn btn-dark" onClick={() => load(q)}>Chercher</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Inscrit le</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{u.email}</td>
                  <td><span className={`badge ${u.isAdmin ? 'badge-blue' : u.role==='seller' ? 'badge-yellow' : 'badge-gray'}`}>{u.isAdmin ? 'admin' : u.role}</span></td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{fmtDate(u.createdAt)}</td>
                  <td><span className={`badge ${u.blocked ? 'badge-red' : 'badge-green'}`}>{u.blocked ? 'Bloqué' : 'Actif'}</span></td>
                  <td><button onClick={() => toggleBlock(u.id, u.blocked)} className={`btn btn-sm ${u.blocked ? 'btn-dark' : 'btn-danger'}`}>{u.blocked ? 'Débloquer' : 'Bloquer'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
