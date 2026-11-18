import { useState, useEffect } from 'react'
import { api } from '../api'; import { fmtPrice } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]); const [loading, setLoading] = useState(true); const [q, setQ] = useState('')
  const load = (search?: string) => { setLoading(true); api.adminProducts(search).then(setProducts).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])
  const del = async (id: string) => { if(!confirm('Supprimer ce produit ?')) return; try { await api.adminDeleteProduct(id); setProducts(p => p.filter(x => x.id !== id)) } catch {} }
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>📦 Produits</h1>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher…" style={{ flex: 1, maxWidth: 300 }} onKeyDown={e => e.key==='Enter' && load(q)} />
          <button className="btn btn-dark" onClick={() => load(q)}>Chercher</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Produit</th><th>Boutique</th><th>Prix</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{p.shop?.name}</td>
                  <td style={{ color: '#facc15', fontWeight: 700 }}>{fmtPrice(p.price)}</td>
                  <td><span className={`badge ${p.stock > 0 ? 'badge-green' : 'badge-red'}`}>{p.stock}</span></td>
                  <td><button onClick={() => del(p.id)} className="btn btn-danger btn-sm">🗑 Supprimer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
