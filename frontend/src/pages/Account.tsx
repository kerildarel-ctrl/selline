import { useState, useEffect } from 'react'; import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'; import { useAuth } from '../context/AuthContext'; import { PageSpinner } from '../components/Spinner'

export default function Account() {
  const { user, logout, refresh } = useAuth(); const navigate = useNavigate()
  if(!user) { navigate('/login'); return null }
  const links = [
    { to:'/account/edit', icon:'✏️', label:'Modifier mon profil' },
    { to:'/orders', icon:'📦', label:'Mes commandes' },
    { to:'/favorites', icon:'❤️', label:'Mes favoris' },
    { to:'/account/addresses', icon:'📍', label:'Mes adresses' },
    { to:'/messages', icon:'💬', label:'Mes messages' },
    { to:'/notifications', icon:'🔔', label:'Notifications' },
  ]
  return (
    <div className="page">
      <div className="container" style={{ maxWidth:480 }}>
        {/* Avatar */}
        <div style={{ textAlign:'center', padding:'32px 0 24px' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#facc15,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:900, color:'#0f172a', margin:'0 auto 14px' }}>
            {user.firstName?.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ fontSize:22, fontWeight:900 }}>{user.firstName} {user.lastName}</h1>
          <p style={{ color:'#475569', fontSize:14, marginTop:4 }}>{user.email}</p>
          {user.role === 'seller' && <span className="badge badge-yellow" style={{ marginTop:8, display:'inline-flex' }}>🏪 Vendeur</span>}
          {user.isAdmin && <span className="badge badge-blue" style={{ marginTop:8, marginLeft:6, display:'inline-flex' }}>⚙️ Admin</span>}
        </div>

        {/* Links */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          {links.map((l, i) => (
            <Link key={l.to} to={l.to} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 20px', borderBottom: i<links.length-1 ? '1px solid rgba(255,255,255,.06)' : 'none', color:'#e2e8f0', transition:'background .15s' }}>
              <span style={{ fontSize:18 }}>{l.icon}</span>
              <span style={{ fontSize:14, fontWeight:500 }}>{l.label}</span>
              <span style={{ marginLeft:'auto', color:'#475569' }}>›</span>
            </Link>
          ))}
        </div>

        {user.role === 'seller' && (
          <Link to="/seller" className="btn btn-dark" style={{ width:'100%', marginTop:14 }}>🏪 Accéder à ma boutique</Link>
        )}
        {user.isAdmin && (
          <Link to="/admin" className="btn btn-dark" style={{ width:'100%', marginTop:10 }}>⚙️ Administration</Link>
        )}

        <button onClick={() => { logout(); navigate('/') }} className="btn btn-danger" style={{ width:'100%', marginTop:14 }}>Déconnexion</button>
      </div>
    </div>
  )
}
