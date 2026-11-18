import { useState, useEffect } from 'react'; import { useNavigate } from 'react-router-dom'
import { api } from '../api'; import { Spinner } from '../components/Spinner'

export default function Addresses() {
  const navigate = useNavigate()
  const [addrs, setAddrs] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ fullName:'', phone:'', city:'', quarter:'', details:'' })
  const [showing, setShowing] = useState(false); const [saving, setSaving] = useState(false); const [err, setErr] = useState('')
  useEffect(() => { api.addresses().then(setAddrs).catch(()=>{}).finally(()=>setLoading(false)) }, [])
  const set=(k:string)=>(e:React.ChangeEvent<HTMLInputElement>)=>setForm(p=>({...p,[k]:e.target.value}))
  const submit = async (e:React.FormEvent) => {
    e.preventDefault(); setErr(''); setSaving(true)
    try { const a = await api.createAddress(form); setAddrs(p=>[...p,a]); setShowing(false); setForm({ fullName:'', phone:'', city:'', quarter:'', details:'' }) }
    catch(ex:any) { setErr(ex.response?.data?.message||'Erreur') }
    setSaving(false)
  }
  const del = async (id:string) => { try { await api.deleteAddress(id); setAddrs(p=>p.filter(a=>a.id!==id)) } catch{} }
  return (
    <div className="page">
      <div className="container" style={{ maxWidth:500 }}>
        <button onClick={()=>navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom:20 }}>← Retour</button>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h1 style={{ fontSize:22, fontWeight:900 }}>Mes adresses</h1>
          <button onClick={()=>setShowing(p=>!p)} className="btn btn-primary btn-sm">+ Ajouter</button>
        </div>
        {showing && <div className="card" style={{ marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Nouvelle adresse</h2>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {err && <div className="alert alert-error">{err}</div>}
            <div className="input-group"><label>Nom complet</label><input className="input" value={form.fullName} onChange={set('fullName')} required /></div>
            <div className="input-group"><label>Téléphone</label><input className="input" type="tel" value={form.phone} onChange={set('phone')} required /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="input-group"><label>Ville</label><input className="input" value={form.city} onChange={set('city')} required /></div>
              <div className="input-group"><label>Quartier</label><input className="input" value={form.quarter} onChange={set('quarter')} required /></div>
            </div>
            <div className="input-group"><label>Précisions</label><input className="input" value={form.details} onChange={set('details')} placeholder="En face de…" /></div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>{saving?<Spinner size={14}/>:'Enregistrer'}</button>
              <button type="button" className="btn btn-ghost" onClick={()=>setShowing(false)}>Annuler</button>
            </div>
          </form>
        </div>}
        {loading ? <div style={{ textAlign:'center', padding:40 }}><Spinner /></div> :
         addrs.length === 0 ? <div style={{ textAlign:'center', padding:'40px 20px', color:'#64748b' }}><p>Aucune adresse enregistrée.</p></div> :
         <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
           {addrs.map(a => (
             <div key={a.id} className="card" style={{ display:'flex', alignItems:'center', gap:12 }}>
               <div style={{ flex:1 }}>
                 <p style={{ fontWeight:700, fontSize:14 }}>{a.fullName}</p>
                 <p style={{ fontSize:13, color:'#64748b' }}>{a.quarter}, {a.city} · {a.phone}</p>
                 {a.details && <p style={{ fontSize:12, color:'#475569', marginTop:2 }}>{a.details}</p>}
               </div>
               <button onClick={()=>del(a.id)} style={{ background:'none', border:'none', color:'#f87171', cursor:'pointer', fontSize:16 }}>🗑</button>
             </div>
           ))}
         </div>}
      </div>
    </div>
  )
}
