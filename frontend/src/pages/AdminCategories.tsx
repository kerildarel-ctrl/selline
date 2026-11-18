import { useState, useEffect } from 'react'; import { Spinner, PageSpinner } from '../components/Spinner'
import { api } from '../api'

export default function AdminCategories() {
  const [cats, setCats] = useState<any[]>([]); const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', slug: '' }); const [saving, setSaving] = useState(false); const [err, setErr] = useState('')
  useEffect(() => { api.categories().then(setCats).catch(() => {}).finally(() => setLoading(false)) }, [])
  const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
  const setName = (e: React.ChangeEvent<HTMLInputElement>) => { const n = e.target.value; setForm({ name: n, slug: slugify(n) }) }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSaving(true)
    try { const c = await api.adminCreateCategory(form); setCats(p => [...p, c]); setForm({ name: '', slug: '' }) }
    catch(ex: any) { setErr(ex.response?.data?.message || 'Erreur') }
    setSaving(false)
  }
  const del = async (id: string) => { if(!confirm('Supprimer ?')) return; try { await api.adminDeleteCategory(id); setCats(p => p.filter(c => c.id !== id)) } catch {} }
  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 500 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24 }}>🏷️ Catégories</h1>
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Ajouter une catégorie</h2>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {err && <div className="alert alert-error">{err}</div>}
            <div className="input-group"><label>Nom</label><input className="input" value={form.name} onChange={setName} required /></div>
            <div className="input-group"><label>Slug</label><input className="input" value={form.slug} onChange={e => setForm(p=>({...p,slug:e.target.value}))} required /></div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Spinner size={14}/> : 'Créer'}</button>
          </form>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {cats.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
              <div>
                <p style={{ fontWeight: 600 }}>{c.name}</p>
                <p style={{ fontSize: 11, color: '#475569' }}>{c.slug}</p>
              </div>
              <button onClick={() => del(c.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 16 }}>🗑</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
