import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'; import { fmtPrice } from '../utils/format'

export default function Cart() {
  const { items, remove, update, clear, total } = useCart(); const navigate = useNavigate()
  if(items.length === 0) return (
    <div className="page">
      <div className="container" style={{ textAlign:'center', padding:'60px 20px' }}>
        <div style={{ fontSize:60, marginBottom:16 }}>🛒</div>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:12 }}>Votre panier est vide</h2>
        <p style={{ color:'#64748b', marginBottom:24 }}>Ajoutez des produits pour les retrouver ici.</p>
        <Link to="/products" className="btn btn-primary">Explorer les produits</Link>
      </div>
    </div>
  )
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize:24, fontWeight:900, marginBottom:24 }}>Panier <span style={{ color:'#64748b', fontWeight:400, fontSize:16 }}>({items.length} article{items.length>1?'s':''})</span></h1>
        <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 300px', gap:24, alignItems:'start' }}>
          {/* Items */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {items.map(({ product: p, qty }) => (
              <div key={p.id} className="card" style={{ display:'flex', gap:14, padding:'14px 16px', alignItems:'center' }}>
                <Link to={`/products/${p.id}`} style={{ width:72, height:72, borderRadius:10, overflow:'hidden', background:'#080c14', flexShrink:0 }}>
                  {p.images[0] ? <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>📦</div>}
                </Link>
                <div style={{ flex:1, minWidth:0 }}>
                  <Link to={`/products/${p.id}`} style={{ fontWeight:700, fontSize:14, display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</Link>
                  <p style={{ fontSize:12, color:'#475569', marginTop:2 }}>{p.shop.name}</p>
                  <p style={{ color:'#facc15', fontWeight:900, marginTop:4 }}>{fmtPrice(p.price)}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4, border:'1px solid rgba(255,255,255,.1)', borderRadius:8 }}>
                  <button onClick={()=>update(p.id,qty-1)} style={{ width:30, height:30, background:'none', border:'none', fontSize:16, color:'#e2e8f0', cursor:'pointer' }}>−</button>
                  <span style={{ width:24, textAlign:'center', fontSize:14, fontWeight:600 }}>{qty}</span>
                  <button onClick={()=>update(p.id,qty+1)} style={{ width:30, height:30, background:'none', border:'none', fontSize:16, color:'#e2e8f0', cursor:'pointer' }}>+</button>
                </div>
                <button onClick={()=>remove(p.id)} style={{ background:'none', border:'none', color:'#475569', cursor:'pointer', fontSize:18, padding:4 }}>🗑</button>
              </div>
            ))}
            <button onClick={clear} className="btn btn-ghost btn-sm" style={{ alignSelf:'flex-start' }}>Vider le panier</button>
          </div>

          {/* Summary */}
          <div className="card" style={{ position:'sticky', top:80 }}>
            <h2 style={{ fontSize:18, fontWeight:800, marginBottom:20 }}>Résumé</h2>
            {items.map(({ product:p, qty }) => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8, color:'#64748b' }}>
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:160 }}>{p.name} ×{qty}</span>
                <span style={{ flexShrink:0 }}>{fmtPrice(p.price * qty)}</span>
              </div>
            ))}
            <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', marginTop:12, paddingTop:12, display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:18 }}>
              <span>Total</span>
              <span style={{ color:'#facc15' }}>{fmtPrice(total)}</span>
            </div>
            <button onClick={()=>navigate('/checkout')} className="btn btn-primary" style={{ width:'100%', marginTop:20 }}>Commander →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
