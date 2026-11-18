import { useState, useEffect } from 'react'; import { Link } from 'react-router-dom'
import { api } from '../api'; import { useAuth } from '../context/AuthContext'; import { fmtPrice, fmtDate, statusLabel } from '../utils/format'
import { PageSpinner } from '../components/Spinner'

export default function Orders() {
  const { user } = useAuth(); const [orders, setOrders] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { api.orders().then(setOrders).catch(()=>{}).finally(()=>setLoading(false)) }, [])
  const statusColor: Record<string,string> = { pending:'badge-gray', confirmed:'badge-blue', shipped:'badge-yellow', delivered:'badge-green', cancelled:'badge-red' }
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize:24, fontWeight:900, marginBottom:24 }}>Mes commandes</h1>
        {orders.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#64748b' }}>
            <div style={{ fontSize:60, marginBottom:12 }}>📦</div>
            <p style={{ marginBottom:20 }}>Vous n'avez pas encore de commandes.</p>
            <Link to="/products" className="btn btn-primary">Explorer les produits</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {orders.map(o => (
              <Link key={o.id} to={`/orders/${o.id}`}>
                <div className="card card-hover" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <p style={{ fontWeight:700, marginBottom:4 }}>#{o.reference}</p>
                    <p style={{ fontSize:12, color:'#475569' }}>{fmtDate(o.createdAt)} · {o.items?.length || '?'} article(s)</p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span className={`badge ${statusColor[o.status] || 'badge-gray'}`} style={{ marginBottom:6, display:'inline-flex' }}>{statusLabel[o.status] || o.status}</span>
                    <p style={{ fontSize:16, fontWeight:900, color:'#facc15' }}>{fmtPrice(o.total)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
