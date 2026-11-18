import { useState, useEffect } from 'react'
import { api } from '../api'; import { fmtDate, stars } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { api.adminReviews().then(setReviews).catch(() => {}).finally(() => setLoading(false)) }, [])
  const del = async (id: string) => { if(!confirm('Supprimer cet avis ?')) return; try { await api.adminDeleteReview(id); setReviews(r => r.filter(x => x.id !== id)) } catch {} }
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>⭐ Avis</h1>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}><p>Aucun avis.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reviews.map(r => (
              <div key={r.id} className="card" style={{ padding: '14px 18px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ color: '#facc15', fontSize: 13 }}>{stars(r.rating)}</span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{fmtDate(r.createdAt)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 4 }}>{r.comment}</p>}
                  <p style={{ fontSize: 11, color: '#475569' }}>Par {r.author} · <span style={{ color: '#64748b' }}>Produit: {r.product?.name}</span></p>
                </div>
                <button onClick={() => del(r.id)} className="btn btn-danger btn-sm">🗑</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
