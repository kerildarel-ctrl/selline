import { useState, useEffect } from 'react'; import { Link } from 'react-router-dom'
import { api } from '../api'; import { Product } from '../types'; import { ProductCard } from '../components/ProductCard'; import { PageSpinner } from '../components/Spinner'

export default function Favorites() {
  const [products, setProducts] = useState<Product[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { api.favorites().then(setProducts).catch(()=>{}).finally(()=>setLoading(false)) }, [])
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize:24, fontWeight:900, marginBottom:24 }}>❤️ Mes favoris</h1>
        {products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#64748b' }}>
            <div style={{ fontSize:60, marginBottom:12 }}>🤍</div>
            <p style={{ marginBottom:20 }}>Vous n'avez pas encore de favoris.</p>
            <Link to="/products" className="btn btn-primary">Explorer les produits</Link>
          </div>
        ) : (
          <div className="products-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </div>
    </div>
  )
}
