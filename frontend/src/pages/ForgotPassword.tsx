import { useState } from 'react'; import { Link } from 'react-router-dom'
import { api } from '../api'; import { Logo } from '../components/Logo'; import { Spinner } from '../components/Spinner'

export default function ForgotPassword() {
  const [email, setEmail] = useState(''); const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(''); const [done, setDone] = useState(false)
  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await api.forgotPassword({ email }); setDone(true) }
    catch(ex:any) { setErr(ex.response?.data?.message || 'Erreur') }
    setLoading(false)
  }
  return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'#080c14' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}><Logo /></div>
        {done ? (
          <div className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📧</div>
            <h2 style={{ fontSize:20, fontWeight:800, marginBottom:12 }}>Email envoyé !</h2>
            <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:20 }}>Vérifiez <strong style={{ color:'#e2e8f0' }}>{email}</strong> pour le lien de réinitialisation.</p>
            <Link to="/login" className="btn btn-dark" style={{ width:'100%' }}>← Retour connexion</Link>
          </div>
        ) : (
          <div className="card">
            <h1 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Mot de passe oublié</h1>
            <p style={{ fontSize:14, color:'#64748b', marginBottom:24 }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {err && <div className="alert alert-error">{err}</div>}
              <div className="input-group"><label>Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.cm" required autoFocus /></div>
              <button className="btn btn-primary" type="submit" style={{ width:'100%' }} disabled={loading}>{loading ? <Spinner size={16}/> : 'Envoyer le lien'}</button>
              <Link to="/login" className="btn btn-ghost" style={{ width:'100%' }}>← Retour</Link>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
