import { useState, useEffect } from 'react'
import { api } from '../api'; import { fmtPrice, fmtDate, statusLabel } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

const STATUS_OPTIONS = ['pending','confirmed','shipped','delivered','cancelled']
const statusColor: Record<string,string> = { pending:'badge-gray', confirmed:'badge-blue', shipped:'badge-yellow', delivered:'badge-green', cancelled:'badge-red' }

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  useEffect(() => { api.sellerOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false)) }, [])

  const updateStatus = async (orderId: string, status: string) => {
    try { await api.updateOrderStatus(orderId, status); setOrders(o => o.map(x => x.id === orderId ? { ...x, status } : x)) } catch {}
  }

  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>📋 Commandes</h1>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p>Aucune commande pour l'instant.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map(o => (
              <div key={o.id} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15 }}>#{o.reference}</p>
                    <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{fmtDate(o.createdAt)} · {o.buyer?.firstName} {o.buyer?.lastName}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 900, color: '#facc15', marginBottom: 6 }}>{fmtPrice(o.total)}</p>
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className="input" style={{ padding: '4px 10px', fontSize: 12, width: 'auto' }}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {o.items?.map((it: any) => (
                    <div key={it.id} style={{ fontSize: 12, color: '#64748b' }}>{it.name} ×{it.qty}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
