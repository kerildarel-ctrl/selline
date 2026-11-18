import { useEffect, useState } from 'react'; import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../api'; import { Logo } from '../components/Logo'; import { Spinner } from '../components/Spinner'

export default function VerifyEmail() {
  const [sp] = useSearchParams(); const token = sp.get('token') || ''
  const [state, setState] = useState<'loading'|'success'|'error'>('loading')
  useEffect(() => { if(!token) { setState('error'); return } api.verifyEmail(token).then(() => setState('success')).catch(() => setState('error')) }, [])
  const icon = { loading:'⏳', success:'✅', error:'❌' }[state]
  const title = { loading:'Vérification…', success:'Email vérifié !', error:'Lien invalide ou expiré' }[state]
  const sub = { loading:'Un instant…', success:'Votre compte est activé. Vous pouvez vous connecter.', error:'Le lien est peut-être expiré. Reconnectez-vous pour en recevoir un nouveau.' }[state]
  return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'#080c14' }}>
      <div style={{ textAlign:'center', maxWidth:380 }}>
        <div style={{ marginBottom:20 }}><Logo /></div>
        {state === 'loading' ? <Spinner size={32} /> : <div style={{ fontSize:56, marginBottom:16 }}>{icon}</div>}
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:12 }}>{title}</h2>
        <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:28 }}>{sub}</p>
        {state !== 'loading' && <Link to="/login" className="btn btn-primary">Aller à la connexion</Link>}
      </div>
    </div>
  )
}
