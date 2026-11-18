import { useState, useEffect } from 'react'; import { Link } from 'react-router-dom'
import { api } from '../api'; import { fmtPrice } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function SellerProducts() {
  const [products, setProducts] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { api.sellerProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false)) }, [])
  const del = async (id: string) => {
    if(!confirm('Supprimer ce produit ?')) return
    try { await api.deleteProduct(id); setProducts(p => p.filter(x => x.id !== id)) } catch {}
  }
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>📦 Mes produits</h1>
          <Link to="/seller/products/new" className="btn btn-primary btn-sm">+ Ajouter</Link>
        </div>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <p style={{ marginBottom: 20 }}>Vous n'avez pas encore de produits.</p>
            <Link to="/seller/products/new" className="btn btn-primary">Créer mon premier produit</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Produit</th><th>Prix</th><th>Stock</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#facc15', fontWeight: 700 }}>{fmtPrice(p.price)}</td>
                    <td><span className={`badge ${p.stock > 0 ? 'badge-green' : 'badge-red'}`}>{p.stock > 0 ? p.stock : 'Épuisé'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/seller/products/${p.id}/edit`} className="btn btn-dark btn-sm">✏️</Link>
                        <button onClick={() => del(p.id)} className="btn btn-danger btn-sm">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
