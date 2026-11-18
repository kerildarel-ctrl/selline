import { useState, useEffect } from 'react'
import { api } from '../api'; import { fmtDate } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function AdminShops() {
  const [shops, setShops] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { api.adminShops().then(setShops).catch(() => {}).finally(() => setLoading(false)) }, [])
  const toggleVerify = async (id: string, verified: boolean) => {
    try { await api.adminVerifyShop(id, !verified); setShops(s => s.map(x => x.id === id ? { ...x, verified: !verified } : x)) } catch {}
  }
  const toggleSuspend = async (id: string, suspended: boolean) => {
    try { await api.adminSuspendShop(id, !suspended); setShops(s => s.map(x => x.id === id ? { ...x, suspended: !suspended } : x)) } catch {}
  }
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>🏪 Boutiques</h1>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Boutique</th><th>Propriétaire</th><th>Ville</th><th>Inscrit le</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {shops.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{s.owner?.firstName} {s.owner?.lastName}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>{s.city || '—'}</td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{fmtDate(s.createdAt)}</td>
                  <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '8px 0' }}>
                    {s.verified && <span className="badge badge-blue">✓ Vérifié</span>}
                    {s.suspended && <span className="badge badge-red">Suspendu</span>}
                    {!s.verified && !s.suspended && <span className="badge badge-gray">En attente</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => toggleVerify(s.id, s.verified)} className={`btn btn-sm ${s.verified ? 'btn-ghost' : 'btn-dark'}`}>{s.verified ? 'Retirer vérif.' : '✓ Vérifier'}</button>
                      <button onClick={() => toggleSuspend(s.id, s.suspended)} className={`btn btn-sm ${s.suspended ? 'btn-dark' : 'btn-danger'}`}>{s.suspended ? 'Réactiver' : 'Suspendre'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
