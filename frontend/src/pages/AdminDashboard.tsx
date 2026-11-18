import { useState, useEffect } from 'react'
import { api } from '../api'; import { fmtPrice } from '../utils/format'; import { PageSpinner } from '../components/Spinner'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null); const [loading, setLoading] = useState(true)
  useEffect(() => { api.adminStats().then(setStats).catch(() => {}).finally(() => setLoading(false)) }, [])
  if(loading) return <PageSpinner />
  const kpis = [
    { icon: '👥', label: 'Utilisateurs', value: stats?.userCount ?? 0, color: '#60a5fa' },
    { icon: '🏪', label: 'Boutiques', value: stats?.shopCount ?? 0, color: '#34d399' },
    { icon: '📦', label: 'Produits', value: stats?.productCount ?? 0, color: '#facc15' },
    { icon: '📋', label: 'Commandes', value: stats?.orderCount ?? 0, color: '#f97316' },
    { icon: '💰', label: 'GMV total', value: fmtPrice(stats?.gmv ?? 0), color: '#a78bfa' },
  ]
  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28 }}>⚙️ Administration</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
          {kpis.map(k => (
            <div key={k.label} className="card" style={{ textAlign: 'center', padding: '20px 14px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{k.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{k.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { href:'/admin/users', icon:'👥', label:'Utilisateurs' },
            { href:'/admin/shops', icon:'🏪', label:'Boutiques' },
            { href:'/admin/products', icon:'📦', label:'Produits' },
            { href:'/admin/categories', icon:'🏷️', label:'Catégories' },
            { href:'/admin/reviews', icon:'⭐', label:'Avis' },
          ].map(l => (
            <a key={l.href} href={l.href}>
              <div className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '16px 18px', transition: 'all .2s' }}>
                <span style={{ fontSize: 24 }}>{l.icon}</span>
                <span style={{ fontWeight: 700 }}>{l.label}</span>
                <span style={{ marginLeft: 'auto', color: '#475569' }}>›</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
