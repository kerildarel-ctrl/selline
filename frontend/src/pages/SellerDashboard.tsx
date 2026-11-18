import { useState, useEffect } from 'react'; import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'; import { useAuth } from '../context/AuthContext'
import { fmtPrice, fmtDate } from '../utils/format'; import { PageSpinner, Spinner } from '../components/Spinner'; import { useToast } from '../components/Toast'

export default function SellerDashboard() {
  const { user } = useAuth(); const { toast } = useToast(); const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null); const [loading, setLoading] = useState(true)

  useEffect(() => {
    if(user && !user.role.includes('seller')) { navigate('/seller/register'); return }
    api.sellerStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  if(loading) return <PageSpinner />

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900 }}>🏪 Ma boutique</h1>
            <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{stats?.shop?.name}</p>
          </div>
          <Link to="/seller/products/new" className="btn btn-primary">+ Produit</Link>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Produits', value: stats?.productCount ?? 0, icon: '📦' },
            { label: 'Commandes', value: stats?.orderCount ?? 0, icon: '📋' },
            { label: 'Ventes totales', value: fmtPrice(stats?.totalSales ?? 0), icon: '💰' },
            { label: 'En attente', value: stats?.pendingOrders ?? 0, icon: '⏳' },
          ].map(k => (
            <div key={k.label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{k.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#facc15' }}>{k.value}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Nav */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { to: '/seller/products', icon: '📦', label: 'Mes produits', desc: 'Gérer votre catalogue' },
            { to: '/seller/orders', icon: '📋', label: 'Commandes', desc: 'Suivre les commandes' },
          ].map(l => (
            <Link key={l.to} to={l.to}>
              <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '18px 20px', transition: 'all .2s' }}>
                <span style={{ fontSize: 28 }}>{l.icon}</span>
                <div>
                  <p style={{ fontWeight: 700 }}>{l.label}</p>
                  <p style={{ fontSize: 12, color: '#475569' }}>{l.desc}</p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#475569' }}>›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
