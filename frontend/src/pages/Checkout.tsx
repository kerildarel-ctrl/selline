import { useState, useEffect } from 'react'; import { useNavigate } from 'react-router-dom'
import { api } from '../api'; import { useCart } from '../context/CartContext'; import { useAuth } from '../context/AuthContext'
import { fmtPrice } from '../utils/format'; import { Spinner } from '../components/Spinner'

export default function Checkout() {
  const { items, total, clear } = useCart(); const { user } = useAuth(); const navigate = useNavigate()
  const [addresses, setAddresses] = useState<any[]>([]); const [selAddr, setSelAddr] = useState('')
  const [method, setMethod] = useState('momo'); const [phone, setPhone] = useState(user?.phone||'')
  const [loading, setLoading] = useState(false); const [err, setErr] = useState('')

  useEffect(() => { api.addresses().then(a => { setAddresses(a); if(a[0]) setSelAddr(a[0].id) }).catch(()=>{}) }, [])
  if(!items.length) { navigate('/cart'); return null }

  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    if(!selAddr) return setErr('Choisissez une adresse de livraison.')
    setErr(''); setLoading(true)
    try {
      const r = await api.createOrder({ items: items.map(i=>({productId:i.product.id, qty:i.qty})), addressId:selAddr, paymentMethod:method, paymentPhone:phone })
      clear(); navigate(`/orders/${r.id}`)
    } catch(ex:any) { setErr(ex.response?.data?.message||'Erreur commande') }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth:600 }}>
        <h1 style={{ fontSize:24, fontWeight:900, marginBottom:24 }}>Finaliser la commande</h1>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {err && <div className="alert alert-error">{err}</div>}

          {/* Adresse */}
          <div className="card">
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>📍 Adresse de livraison</h2>
            {addresses.length === 0 ? (
              <div><p style={{ color:'#64748b', marginBottom:12 }}>Aucune adresse enregistrée.</p>
                <a href="/account/addresses" className="btn btn-dark btn-sm">+ Ajouter une adresse</a></div>
            ) : addresses.map(a => (
              <label key={a.id} style={{ display:'flex', gap:10, padding:'10px 0', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                <input type="radio" name="addr" value={a.id} checked={selAddr===a.id} onChange={()=>setSelAddr(a.id)} />
                <div style={{ fontSize:14 }}>
                  <p style={{ fontWeight:600 }}>{a.fullName}</p>
                  <p style={{ color:'#64748b', fontSize:13 }}>{a.quarter}, {a.city} · {a.phone}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Paiement */}
          <div className="card">
            <h2 style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>💳 Paiement</h2>
            {[{val:'momo',label:'📱 MTN Mobile Money'},{val:'orange',label:'🟠 Orange Money'},{val:'livraison',label:'🚚 Paiement à la livraison'}].map(o => (
              <label key={o.val} style={{ display:'flex', gap:10, padding:'10px 0', cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,.06)', alignItems:'center' }}>
                <input type="radio" name="method" value={o.val} checked={method===o.val} onChange={()=>setMethod(o.val)} />
                <span style={{ fontSize:14, fontWeight:500 }}>{o.label}</span>
              </label>
            ))}
            {method !== 'livraison' && (
              <div className="input-group" style={{ marginTop:12 }}>
                <label>Numéro de paiement</label>
                <input className="input" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="6XX XX XX XX" required />
              </div>
            )}
          </div>

          {/* Total */}
          <div className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              {items.map(i => <p key={i.product.id} style={{ fontSize:12, color:'#475569' }}>{i.product.name} ×{i.qty}</p>)}
            </div>
            <div style={{ textAlign:'right' }}>
              <p style={{ fontSize:11, color:'#475569' }}>Total</p>
              <p style={{ fontSize:22, fontWeight:900, color:'#facc15' }}>{fmtPrice(total)}</p>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading||!selAddr}>
            {loading ? <Spinner size={18}/> : 'Passer la commande'}
          </button>
        </form>
      </div>
    </div>
  )
}
