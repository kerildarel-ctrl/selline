import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Product } from '../types'
import { useCart } from '../context/CartContext'
import { fmtPrice, stars } from '../utils/format'

export function ProductCard({ product: p }: { product: Product }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const [hover, setHover] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    add(p, 1); setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link to={`/products/${p.id}`}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ background:'#0f172a', border:`1px solid ${hover ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.08)'}`, borderRadius:14, overflow:'hidden', transition:'all .2s', transform: hover ? 'translateY(-2px)' : 'none', boxShadow: hover ? '0 12px 40px rgba(0,0,0,.4)' : 'none', cursor:'pointer' }}>
        
        {/* Image */}
        <div style={{ position:'relative', aspectRatio:'1', background:'#080c14', overflow:'hidden' }}>
          {p.images[0]
            ? <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s', transform: hover ? 'scale(1.04)' : 'scale(1)' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>📦</div>
          }
          {/* Badges top */}
          <div style={{ position:'absolute', top:8, left:8, display:'flex', gap:4, flexWrap:'wrap' }}>
            {p.freeShipping && <span style={{ background:'rgba(16,185,129,.9)', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4 }}>Livraison offerte</span>}
            {p.shop.verified && <span style={{ background:'rgba(96,165,250,.9)', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4 }}>✓ Vérifié</span>}
          </div>
          {!p.inStock && (
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'#f87171', fontWeight:700, fontSize:12 }}>Rupture de stock</span>
            </div>
          )}
          {/* Quick add */}
          {p.inStock && hover && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:8, background:'linear-gradient(transparent, rgba(0,0,0,.8))' }}>
              <button onClick={handleAdd} style={{ width:'100%', padding:'7px', borderRadius:8, background: added ? '#10b981' : '#facc15', color:'#0f172a', border:'none', fontWeight:700, fontSize:12, cursor:'pointer', transition:'background .2s' }}>
                {added ? '✓ Ajouté !' : '🛒 Ajouter'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding:'10px 12px 12px' }}>
          <p style={{ fontSize:11, color:'#475569', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.shop.name}</p>
          <p style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', lineHeight:1.3, marginBottom:5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', minHeight:34 }}>{p.name}</p>
          {p.rating > 0 && <p style={{ fontSize:11, color:'#facc15', marginBottom:4 }}>{stars(p.rating)} <span style={{ color:'#475569' }}>({p.reviewCount})</span></p>}
          <p style={{ fontWeight:900, fontSize:14, color:'#facc15' }}>{fmtPrice(p.price)}</p>
        </div>
      </div>
    </Link>
  )
}
