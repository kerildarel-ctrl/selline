import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'

export default function Welcome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  useEffect(() => { if (user) navigate('/home') }, [user])

  return (
    <div style={{ minHeight:'100dvh', background:'#080c14', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>
      {/* Orbs décoratifs */}
      <div style={{ position:'fixed', top:'-15%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(250,204,21,.07) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-10%', left:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(249,115,22,.06) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', top:'40%', left:'30%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* Header */}
      <header style={{ padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:10 }}>
        <Logo size="md" />
        <div style={{ display:'flex', gap:8 }}>
          <Link to="/login" className="btn btn-outline btn-sm">Connexion</Link>
          <Link to="/register" className="btn btn-primary btn-sm">S'inscrire</Link>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px 20px', textAlign:'center', position:'relative', zIndex:10 }} className="fade-up">
        <div style={{ marginBottom:20 }}>
          <span style={{ display:'inline-block', background:'rgba(250,204,21,.1)', border:'1px solid rgba(250,204,21,.2)', color:'#facc15', fontSize:12, fontWeight:700, padding:'5px 16px', borderRadius:999, letterSpacing:'.5px' }}>
            🇨🇲 MARKETPLACE CAMEROUN
          </span>
        </div>
        <h1 style={{ fontSize:'clamp(36px,7vw,70px)', fontWeight:900, lineHeight:1.08, marginBottom:20, letterSpacing:'-1.5px', maxWidth:720 }}>
          Le commerce en ligne{' '}
          <span className="text-gradient">réinventé</span>{' '}
          au Cameroun
        </h1>
        <p style={{ fontSize:18, color:'#64748b', maxWidth:480, lineHeight:1.7, marginBottom:40 }}>
          Achetez et vendez en toute confiance avec Mobile Money, vendeurs vérifiés et livraison rapide.
        </p>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', marginBottom:60 }}>
          <Link to="/register" className="btn btn-primary btn-lg">Commencer gratuitement →</Link>
          <Link to="/products" className="btn btn-dark btn-lg">Explorer le catalogue</Link>
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:48, flexWrap:'wrap', justifyContent:'center', marginBottom:60, paddingBottom:60, borderBottom:'1px solid rgba(255,255,255,.07)', width:'100%', maxWidth:600 }}>
          {[['500+','Vendeurs'],['10 000+','Produits'],['100%','Sécurisé']].map(([n,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontSize:30, fontWeight:900, color:'#facc15' }}>{n}</div>
              <div style={{ fontSize:13, color:'#475569', marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14, maxWidth:800, width:'100%' }}>
          {[
            { icon:'📱', title:'Mobile Money', desc:'MTN MoMo et Orange Money. Paiement sécurisé et instantané.' },
            { icon:'✅', title:'Vendeurs vérifiés', desc:'Badge de confiance visible. Boutiques contrôlées par Selline.' },
            { icon:'🚚', title:'Livraison rapide', desc:'Livraison dans toutes les grandes villes du Cameroun.' },
          ].map(f => (
            <div key={f.title} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:16, padding:'22px 20px', textAlign:'left' }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{f.icon}</div>
              <h3 style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:'#475569', lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
