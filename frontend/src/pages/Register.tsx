import { useState } from 'react'; import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'; import { Logo } from '../components/Logo'; import { Spinner } from '../components/Spinner'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', phone:'', password:'' })
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false); const [done, setDone] = useState(false)
  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement>) => setForm(p=>({...p,[k]:e.target.value}))
  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    if(form.password.length < 8) return setErr('Minimum 8 caractères.')
    setErr(''); setLoading(true)
    try { await api.register(form); setDone(true) }
    catch(ex:any) { setErr(ex.response?.data?.message || 'Erreur') }
    setLoading(false)
  }
  if(done) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'#080c14' }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        <div style={{ fontSize:60, marginBottom:16 }}>📧</div>
        <h2 style={{ fontSize:22, fontWeight:800, marginBottom:12 }}>Vérifiez votre email !</h2>
        <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:24 }}>Un lien a été envoyé à <strong style={{ color:'#e2e8f0' }}>{form.email}</strong>. Cliquez dessus pour activer votre compte.</p>
        <Link to="/login" className="btn btn-primary">Aller à la connexion</Link>
      </div>
    </div>
  )
  return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'#080c14' }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}><Logo /></div>
        <div className="card">
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:24 }}>Créer un compte</h1>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {err && <div className="alert alert-error">{err}</div>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="input-group"><label>Prénom</label><input className="input" value={form.firstName} onChange={set('firstName')} placeholder="Kero" required /></div>
              <div className="input-group"><label>Nom</label><input className="input" value={form.lastName} onChange={set('lastName')} placeholder="Demo" required /></div>
            </div>
            <div className="input-group"><label>Email</label><input className="input" type="email" value={form.email} onChange={set('email')} placeholder="vous@exemple.cm" required /></div>
            <div className="input-group"><label>Téléphone (optionnel)</label><input className="input" type="tel" value={form.phone} onChange={set('phone')} placeholder="670 00 00 00" /></div>
            <div className="input-group"><label>Mot de passe</label><input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 caractères" required /></div>
            <button className="btn btn-primary" type="submit" style={{ width:'100%', marginTop:4 }} disabled={loading}>{loading ? <Spinner size={16}/> : 'Créer mon compte'}</button>
          </form>
        </div>
        <p style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#475569' }}>Déjà un compte ? <Link to="/login" style={{ color:'#facc15', fontWeight:600 }}>Se connecter</Link></p>
      </div>
    </div>
  )
}
