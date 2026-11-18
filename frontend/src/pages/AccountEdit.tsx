import { useState, useEffect } from 'react'; import { useNavigate } from 'react-router-dom'
import { api } from '../api'; import { useAuth } from '../context/AuthContext'; import { Spinner } from '../components/Spinner'; import { useToast } from '../components/Toast'

export default function AccountEdit() {
  const { user, refresh } = useAuth(); const navigate = useNavigate(); const { toast } = useToast()
  const [form, setForm] = useState({ firstName:'', lastName:'', phone:'', city:'' })
  const [loading, setLoading] = useState(false); const [err, setErr] = useState('')
  useEffect(() => { if(user) setForm({ firstName:user.firstName||'', lastName:user.lastName||'', phone:user.phone||'', city:user.city||'' }) }, [user])
  const set = (k:string)=>(e:React.ChangeEvent<HTMLInputElement>)=>setForm(p=>({...p,[k]:e.target.value}))
  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await api.updateAccount(form); await refresh(); toast('Profil mis à jour !','success'); navigate('/account') }
    catch(ex:any) { setErr(ex.response?.data?.message||'Erreur') }
    setLoading(false)
  }
  return (
    <div className="page">
      <div className="container" style={{ maxWidth:440 }}>
        <button onClick={()=>navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>← Retour</button>
        <div className="card">
          <h1 style={{ fontSize:20, fontWeight:800, marginBottom:24 }}>Modifier mon profil</h1>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {err && <div className="alert alert-error">{err}</div>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="input-group"><label>Prénom</label><input className="input" value={form.firstName} onChange={set('firstName')} required /></div>
              <div className="input-group"><label>Nom</label><input className="input" value={form.lastName} onChange={set('lastName')} required /></div>
            </div>
            <div className="input-group"><label>Téléphone</label><input className="input" type="tel" value={form.phone} onChange={set('phone')} /></div>
            <div className="input-group"><label>Ville</label><input className="input" value={form.city} onChange={set('city')} /></div>
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? <Spinner size={16}/> : 'Enregistrer'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
