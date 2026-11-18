import { useState, useEffect } from 'react'; import { Link } from 'react-router-dom'
import { api } from '../api'; import { Product, Category } from '../types'; import { ProductCard } from '../components/ProductCard'
import { PageSpinner } from '../components/Spinner'

export default function Home() {
  const [cats, setCats] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState<string|null>(null)

  useEffect(() => {
    api.categories().then(setCats).catch(()=>{})
    fetchProducts()
  }, [])

  const fetchProducts = async (categoryId?: string) => {
    setLoading(true)
    try {
      const r = await api.products({ category: categoryId, limit: 20, sort: 'recent' })
      setProducts(r.products)
    } catch {}
    setLoading(false)
  }

  const selectCat = (id: string|null) => { setCat(id); fetchProducts(id||undefined) }

  return (
    <div className="page">
      <div className="container">
        {/* Hero banner */}
        <div style={{ background:'linear-gradient(135deg,#1a1040,#0f172a)', borderRadius:20, padding:'32px 28px', marginBottom:28, border:'1px solid rgba(250,204,21,0.15)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(250,204,21,.08),transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <span className="badge badge-yellow" style={{ marginBottom:12, display:'inline-flex' }}>✨ Nouveau sur Selline</span>
            <h1 style={{ fontSize:'clamp(22px,4vw,34px)', fontWeight:900, lineHeight:1.2, marginBottom:10 }}>Découvrez les meilleurs<br/><span className="text-gradient">produits camerounais</span></h1>
            <p style={{ fontSize:14, color:'#64748b', marginBottom:20, maxWidth:360 }}>Mobile Money accepté · Vendeurs vérifiés · Livraison rapide</p>
            <Link to="/products" className="btn btn-primary">Voir tous les produits →</Link>
          </div>
        </div>

        {/* Categories scroll */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, marginBottom:24, scrollbarWidth:'none' }}>
          <button onClick={() => selectCat(null)}
            style={{ flexShrink:0, padding:'7px 16px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'all .18s',
              background: cat===null ? '#facc15' : 'rgba(255,255,255,0.05)',
              borderColor: cat===null ? '#facc15' : 'rgba(255,255,255,0.1)',
              color: cat===null ? '#0f172a' : '#94a3b8' }}>Tout</button>
          {cats.map(c => (
            <button key={c.id} onClick={() => selectCat(c.id)}
              style={{ flexShrink:0, padding:'7px 16px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'all .18s',
                background: cat===c.id ? '#facc15' : 'rgba(255,255,255,0.05)',
                borderColor: cat===c.id ? '#facc15' : 'rgba(255,255,255,0.1)',
                color: cat===c.id ? '#0f172a' : '#94a3b8' }}>{c.name}</button>
          ))}
        </div>

        {/* Products */}
        {loading ? <PageSpinner /> : products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#475569' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📦</div>
            <p style={{ marginBottom:16 }}>Aucun produit pour l'instant.</p>
            <Link to="/seller/register" className="btn btn-primary">Ouvrir une boutique</Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
