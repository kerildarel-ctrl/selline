import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Bell, User, Search, X, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { Logo } from './Logo'
import { api } from '../api'

export function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [notifs, setNotifs] = useState(0)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (user) api.counters().then(c => setNotifs(c.notifications)).catch(() => {})
  }, [user])

  const search = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) navigate(`/products?q=${encodeURIComponent(q.trim())}`) }

  return (
    <header style={{
      position:'sticky', top:0, zIndex:50,
      background: scrolled ? 'rgba(8,12,20,0.95)' : '#080c14',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      transition: 'all .25s',
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', gap:12, height:60 }}>
        <Logo size="sm" />
        <form onSubmit={search} style={{ flex:1, maxWidth:420, position:'relative' }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#475569', pointerEvents:'none' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher..." className="input"
            style={{ paddingLeft:36, height:38, fontSize:13, borderRadius:999, background:'rgba(255,255,255,0.06)' }} />
        </form>

        <div style={{ display:'flex', alignItems:'center', gap:4, marginLeft:'auto' }}>
          <Link to="/cart" style={{ position:'relative', padding:8, display:'flex', alignItems:'center', color:'#64748b', borderRadius:'50%' }}>
            <ShoppingCart size={20} />
            {count > 0 && <span style={{ position:'absolute', top:2, right:2, background:'#facc15', color:'#0f172a', fontSize:9, fontWeight:700, minWidth:16, height:16, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>{count}</span>}
          </Link>

          {user ? (
            <>
              <Link to="/notifications" style={{ position:'relative', padding:8, display:'flex', alignItems:'center', color:'#64748b', borderRadius:'50%' }}>
                <Bell size={20} />
                {notifs > 0 && <span style={{ position:'absolute', top:2, right:2, background:'#ef4444', color:'#fff', fontSize:9, fontWeight:700, minWidth:14, height:14, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>{notifs}</span>}
              </Link>
              <button onClick={() => setMenu(p => !p)} style={{ padding:8, background:'none', border:'none', color:'#64748b', display:'flex', alignItems:'center', borderRadius:'50%' }}>
                {menu ? <X size={20} /> : <User size={20} />}
              </button>
              {menu && (
                <div style={{ position:'absolute', top:64, right:12, background:'#1a2234', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, padding:8, minWidth:200, zIndex:200, boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
                  <div style={{ padding:'8px 12px 12px', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:6 }}>
                    <p style={{ fontWeight:700, fontSize:14 }}>{user.firstName} {user.lastName}</p>
                    <p style={{ fontSize:11, color:'#475569' }}>{user.email}</p>
                  </div>
                  {[{to:'/account',l:'👤 Mon compte'},{to:'/orders',l:'📦 Commandes'},{to:'/favorites',l:'❤️ Favoris'},{to:'/messages',l:'💬 Messages'}].map(x => (
                    <Link key={x.to} to={x.to} onClick={() => setMenu(false)} style={{ display:'block', padding:'8px 12px', fontSize:13, borderRadius:8, color:'#cbd5e1', transition:'background .15s' }}>{x.l}</Link>
                  ))}
                  {user.role === 'seller' && <Link to="/seller" onClick={() => setMenu(false)} style={{ display:'block', padding:'8px 12px', fontSize:13, borderRadius:8, color:'#facc15' }}>🏪 Ma boutique</Link>}
                  {user.isAdmin && <Link to="/admin" onClick={() => setMenu(false)} style={{ display:'block', padding:'8px 12px', fontSize:13, borderRadius:8, color:'#a78bfa' }}>⚙️ Admin</Link>}
                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', marginTop:6, paddingTop:6 }}>
                    <button onClick={() => { logout(); setMenu(false); navigate('/') }} style={{ width:'100%', textAlign:'left', padding:'8px 12px', fontSize:13, background:'none', border:'none', color:'#f87171', borderRadius:8, cursor:'pointer' }}>🚪 Déconnexion</button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Connexion</Link>
          )}
        </div>
      </div>
    </header>
  )
}
