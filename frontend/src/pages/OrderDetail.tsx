import { useState, useEffect } from 'react'; import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'; import { fmtPrice, fmtDate, statusLabel } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function OrderDetail() {
  const { id } = useParams(); const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null); const [loading, setLoading] = useState(true)
  useEffect(() => { if(!id) return; api.order(id).then(setOrder).catch(()=>navigate('/orders')).finally(()=>setLoading(false)) }, [id])
  if(loading) return <PageSpinner />
  if(!order) return null
  const addr = order.address ? (typeof order.address === 'string' ? JSON.parse(order.address) : order.address) : null
  const statusColor: Record<string,string> = { pending:'badge-gray', confirmed:'badge-blue', shipped:'badge-yellow', delivered:'badge-green', cancelled:'badge-red' }
  return (
    <div className="page">
      <div className="container" style={{ maxWidth:600 }}>
        <button onClick={()=>navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>← Mes commandes</button>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h1 style={{ fontSize:22, fontWeight:900 }}>Commande #{order.reference}</h1>
          <span className={`badge ${statusColor[order.status]||'badge-gray'}`}>{statusLabel[order.status]||order.status}</span>
        </div>
        <p style={{ fontSize:12, color:'#475569', marginBottom:24 }}>Passée le {fmtDate(order.createdAt)}</p>

        {/* Items */}
        <div className="card" style={{ marginBottom:16 }}>
          <h2 style={{ fontWeight:700, marginBottom:14 }}>Articles</h2>
          {order.items?.map((it:any) => (
            <div key={it.id} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,.06)', alignItems:'center' }}>
              {it.image && <img src={it.image} alt={it.name} style={{ width:48, height:48, borderRadius:8, objectFit:'cover' }} />}
              <div style={{ flex:1 }}><p style={{ fontWeight:600, fontSize:13 }}>{it.name}</p><p style={{ fontSize:11, color:'#475569' }}>×{it.qty}</p></div>
              <p style={{ fontWeight:700, color:'#facc15', fontSize:14 }}>{fmtPrice(it.price * it.qty)}</p>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:14, fontWeight:900 }}>
            <span>Total</span><span style={{ color:'#facc15', fontSize:18 }}>{fmtPrice(order.total)}</span>
          </div>
        </div>

        {/* Adresse */}
        {addr && <div className="card" style={{ marginBottom:16 }}>
          <h2 style={{ fontWeight:700, marginBottom:10 }}>📍 Livraison</h2>
          <p style={{ fontSize:14, fontWeight:600 }}>{addr.fullName}</p>
          <p style={{ fontSize:13, color:'#64748b' }}>{addr.quarter}, {addr.city}</p>
          <p style={{ fontSize:13, color:'#64748b' }}>📞 {addr.phone}</p>
        </div>}

        {/* Paiement */}
        <div className="card">
          <h2 style={{ fontWeight:700, marginBottom:10 }}>💳 Paiement</h2>
          <p style={{ fontSize:14, color:'#64748b' }}>{order.paymentMethod === 'momo' ? 'MTN Mobile Money' : order.paymentMethod === 'orange' ? 'Orange Money' : 'Paiement à la livraison'}</p>
          {order.paymentPhone && <p style={{ fontSize:13, color:'#64748b' }}>{order.paymentPhone}</p>}
        </div>
      </div>
    </div>
  )
}
