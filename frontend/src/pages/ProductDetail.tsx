import { useState, useEffect } from 'react'; import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api'; import { Product } from '../types'; import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'; import { useToast } from '../components/Toast'
import { fmtPrice, fmtDate, stars } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function ProductDetail() {
  const { id } = useParams(); const { user } = useAuth(); const { add } = useCart()
  const { toast } = useToast(); const navigate = useNavigate()
  const [p, setP] = useState<Product|null>(null); const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1); const [mainImg, setMainImg] = useState(0); const [lightbox, setLightbox] = useState(false)
  const [faved, setFaved] = useState(false); const [adding, setAdding] = useState(false)

  useEffect(() => {
    if(!id) return
    api.product(id).then(pr => { setP(pr); setFaved(pr.isFavorite||false) }).catch(()=>navigate('/products')).finally(()=>setLoading(false))
  }, [id])

  const addCart = () => { if(!p) return; add(p, qty); setAdded(true); setTimeout(()=>setAdded(false),1500); toast('Ajouté au panier ✓', 'success') }
  const [added, setAdded] = useState(false)

  const toggleFav = async () => {
    if(!user) return navigate('/login'); if(!p) return
    try { faved ? await api.removeFavorite(p.id) : await api.addFavorite(p.id); setFaved(!faved) } catch{}
  }

  const share = async () => {
    if(navigator.share) await navigator.share({ title: p?.name, url: location.href })
    else { await navigator.clipboard.writeText(location.href); toast('Lien copié !', 'success') }
  }

  if(loading) return <PageSpinner />
  if(!p) return null

  return (
    <div className="page">
      <div className="container">
        {/* Back */}
        <button onClick={()=>navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>← Retour</button>

        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:32, alignItems:'start' }}>
          {/* Gallery */}
          <div>
            <div style={{ position:'relative', borderRadius:16, overflow:'hidden', aspectRatio:'1', background:'#0f172a', cursor:'zoom-in' }} onClick={()=>setLightbox(true)}>
              {p.images[mainImg]
                ? <img src={p.images[mainImg]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:80 }}>📦</div>}
            </div>
            {p.images.length > 1 && (
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                {p.images.map((img,i) => <button key={i} onClick={()=>setMainImg(i)} style={{ width:60, height:60, borderRadius:10, overflow:'hidden', border:`2px solid ${mainImg===i?'#facc15':'transparent'}`, padding:0, cursor:'pointer', background:'#0f172a' }}><img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /></button>)}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div style={{ marginBottom:8 }}>
              {p.category && <span className="badge badge-gray">{p.category.name}</span>}
              {p.shop.verified && <span className="badge badge-blue" style={{ marginLeft:6 }}>✓ Boutique vérifiée</span>}
            </div>
            <h1 style={{ fontSize:'clamp(18px,3vw,26px)', fontWeight:900, lineHeight:1.3, marginBottom:12 }}>{p.name}</h1>
            {p.rating > 0 && <p style={{ fontSize:14, marginBottom:12 }}><span style={{ color:'#facc15' }}>{stars(p.rating)}</span> <span style={{ color:'#475569' }}>({p.reviewCount} avis)</span></p>}
            <div style={{ fontSize:'clamp(24px,4vw,34px)', fontWeight:900, color:'#facc15', marginBottom:20 }}>{fmtPrice(p.price)}</div>

            {!p.inStock ? (
              <div className="alert alert-error" style={{ marginBottom:16 }}>Rupture de stock</div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
                <div style={{ display:'flex', alignItems:'center', border:'1px solid rgba(255,255,255,.12)', borderRadius:10, overflow:'hidden' }}>
                  <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{ width:36, height:36, background:'none', border:'none', fontSize:18, color:'#e2e8f0', cursor:'pointer' }}>−</button>
                  <span style={{ width:36, textAlign:'center', fontWeight:700 }}>{qty}</span>
                  <button onClick={()=>setQty(q=>Math.min(99,q+1))} style={{ width:36, height:36, background:'none', border:'none', fontSize:18, color:'#e2e8f0', cursor:'pointer' }}>+</button>
                </div>
                <button onClick={addCart} className={`btn ${added?'btn-dark':'btn-primary'}`} style={{ flex:1 }}>{added ? '✓ Ajouté !' : '🛒 Ajouter au panier'}</button>
              </div>
            )}

            <div style={{ display:'flex', gap:8, marginBottom:24 }}>
              <button onClick={toggleFav} className="btn btn-dark btn-sm">{faved ? '❤️ Favori' : '🤍 Ajouter aux favoris'}</button>
              <button onClick={share} className="btn btn-dark btn-sm">🔗 Partager</button>
            </div>

            {p.description && <div style={{ fontSize:14, color:'#64748b', lineHeight:1.8, marginBottom:20, padding:'16px', background:'rgba(255,255,255,.03)', borderRadius:12 }}>{p.description}</div>}

            {p.freeShipping && <div className="alert alert-success" style={{ marginBottom:12 }}>🚚 Livraison offerte</div>}

            {/* Boutique */}
            <div style={{ padding:'16px', background:'rgba(255,255,255,.04)', borderRadius:14, border:'1px solid rgba(255,255,255,.08)' }}>
              <p style={{ fontSize:11, color:'#475569', marginBottom:4 }}>Vendu par</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:15 }}>{p.shop.name}</p>
                  {p.shop.city && <p style={{ fontSize:12, color:'#475569' }}>📍 {p.shop.city}</p>}
                </div>
                {p.shop.phone && (
                  <a href={`https://wa.me/${p.shop.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener" className="btn btn-primary btn-sm">📱 Contacter</a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Avis */}
        {p.reviews && p.reviews.length > 0 && (
          <div style={{ marginTop:40 }}>
            <h2 style={{ fontSize:20, fontWeight:800, marginBottom:16 }}>Avis clients</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {p.reviews.map((r:any) => (
                <div key={r.id} className="card" style={{ padding:'16px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(250,204,21,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#facc15', fontSize:14 }}>{r.author?.charAt(0).toUpperCase()}</div>
                    <div>
                      <p style={{ fontWeight:600, fontSize:13 }}>{r.author}</p>
                      <p style={{ fontSize:11, color:'#475569' }}>{fmtDate(r.createdAt)}</p>
                    </div>
                    <span style={{ marginLeft:'auto', color:'#facc15', fontSize:14 }}>{stars(r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.7 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightbox && (
          <div onClick={()=>setLightbox(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.9)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20, cursor:'zoom-out' }}>
            <img src={p.images[mainImg]} alt={p.name} style={{ maxWidth:'90vw', maxHeight:'90vh', objectFit:'contain', borderRadius:16 }} onClick={e=>e.stopPropagation()} />
          </div>
        )}
      </div>
    </div>
  )
}
