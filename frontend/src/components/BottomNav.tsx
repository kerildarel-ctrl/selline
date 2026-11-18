import { NavLink } from 'react-router-dom'
import { Home, Search, ShoppingCart, Package, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export function BottomNav() {
  const { count } = useCart()
  const { user } = useAuth()
  const items = [
    { to: '/home', Icon: Home, label: 'Accueil' },
    { to: '/products', Icon: Search, label: 'Explorer' },
    { to: '/cart', Icon: ShoppingCart, label: 'Panier', badge: count > 0 ? count : 0 },
    { to: user ? '/orders' : '/login', Icon: Package, label: 'Commandes' },
    { to: user ? '/account' : '/login', Icon: User, label: user ? user.firstName : 'Compte' },
  ]
  return (
    <nav style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:50, background:'rgba(8,12,20,0.97)', backdropFilter:'blur(16px)', borderTop:'1px solid rgba(255,255,255,0.08)', display:'flex' }}>
      {items.map(({ to, Icon, label, badge }) => (
        <NavLink key={to} to={to} style={({ isActive }) => ({
          flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding:'8px 4px', gap:3, textDecoration:'none', position:'relative',
          color: isActive ? '#facc15' : '#475569', transition:'color .2s',
        })}>
          {({ isActive }) => (
            <>
              <div style={{ position:'relative', background: isActive ? 'rgba(250,204,21,0.12)' : 'transparent', borderRadius:10, padding:'4px 10px', transition:'background .2s' }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {badge ? <span style={{ position:'absolute', top:-4, right:-4, background:'#facc15', color:'#0f172a', fontSize:9, fontWeight:700, minWidth:15, height:15, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{badge}</span> : null}
              </div>
              <span style={{ fontSize:9, fontWeight:600, letterSpacing:'.2px' }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
