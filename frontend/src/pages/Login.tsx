import { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'; import { api } from '../api'
import { Logo } from '../components/Logo'; import { Spinner } from '../components/Spinner'

export default function Login() {
  const { login } = useAuth(); const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const [needsVerify, setNeedsVerify] = useState(false); const [resent, setResent] = useState(false)
  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement>) => setForm(p=>({...p,[k]:e.target.value}))

  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const { token, user } = await api.login(form)
      login(token, user)
      navigate(user.isAdmin ? '/admin' : user.role === 'seller' ? '/seller' : '/home')
    } catch(ex:any) {
      const msg = ex.response?.data?.message || 'Erreur'
      if(msg.toLowerCase().includes('vérif')) setNeedsVerify(true); else setErr(msg)
    }
    setLoading(false)
  }

  const resend = async () => {
    try { await api.resendVerificationPublic({ email:form.email, password:form.password }); setResent(true) } catch{}
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'#080c14' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}><Logo /></div>
        <div className="card">
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:24 }}>Connexion</h1>
          {needsVerify ? (
            <div>
              <div className="alert alert-info" style={{ marginBottom:16 }}>Votre email n'est pas vérifié.</div>
              {resent ? <div className="alert alert-success">📧 Lien renvoyé ! Vérifiez votre boîte mail.</div>
                : <button onClick={resend} className="btn btn-primary" style={{ width:'100%' }}>Renvoyer le lien de vérification</button>}
              <button onClick={() => setNeedsVerify(false)} className="btn btn-ghost" style={{ width:'100%', marginTop:8 }}>← Retour</button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {err && <div className="alert alert-error">{err}</div>}
              <div className="input-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={set('email')} placeholder="vous@exemple.cm" required autoFocus /></div>
              <div className="input-group"><label>Mot de passe</label><input className="input" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required /></div>
              <div style={{ textAlign:'right' }}><Link to="/forgot-password" style={{ fontSize:12, color:'#475569' }}>Mot de passe oublié ?</Link></div>
              <button className="btn btn-primary" type="submit" style={{ width:'100%', marginTop:4 }} disabled={loading}>{loading ? <Spinner size={16}/> : 'Se connecter'}</button>
            </form>
          )}
        </div>
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#475569' }}>
          Pas de compte ? <Link to="/register" style={{ color:'#facc15', fontWeight:600 }}>Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}
