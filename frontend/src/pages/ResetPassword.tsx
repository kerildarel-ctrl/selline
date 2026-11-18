import { useState } from 'react'; import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api'; import { Logo } from '../components/Logo'; import { Spinner } from '../components/Spinner'

export default function ResetPassword() {
  const [sp] = useSearchParams(); const token = sp.get('token') || ''; const navigate = useNavigate()
  const [form, setForm] = useState({ password:'', confirm:'' })
  const [err, setErr] = useState(''); const [loading, setLoading] = useState(false)
  const set = (k:string)=>(e:React.ChangeEvent<HTMLInputElement>)=>setForm(p=>({...p,[k]:e.target.value}))
  const submit = async (e:React.FormEvent) => {
    e.preventDefault()
    if(form.password !== form.confirm) return setErr('Les mots de passe ne correspondent pas.')
    if(form.password.length < 8) return setErr('Minimum 8 caractères.')
    setErr(''); setLoading(true)
    try { await api.resetPassword({ token, password:form.password }); navigate('/login?reset=1') }
    catch(ex:any) { setErr(ex.response?.data?.message || 'Lien invalide ou expiré.') }
    setLoading(false)
  }
  return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, background:'#080c14' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}><Logo /></div>
        <div className="card">
          <h1 style={{ fontSize:22, fontWeight:800, marginBottom:24 }}>Nouveau mot de passe</h1>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {err && <div className="alert alert-error">{err}</div>}
            <div className="input-group"><label>Nouveau mot de passe</label><input className="input" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 caractères" required autoFocus /></div>
            <div className="input-group"><label>Confirmer</label><input className="input" type="password" value={form.confirm} onChange={set('confirm')} placeholder="Répétez le mot de passe" required /></div>
            <button className="btn btn-primary" type="submit" style={{ width:'100%' }} disabled={loading || !token}>{loading ? <Spinner size={16}/> : 'Réinitialiser'}</button>
            <Link to="/login" className="btn btn-ghost" style={{ width:'100%' }}>← Retour</Link>
          </form>
        </div>
      </div>
    </div>
  )
}
