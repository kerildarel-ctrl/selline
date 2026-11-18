import { useState } from 'react'; import { useNavigate } from 'react-router-dom'
import { api } from '../api'; import { useAuth } from '../context/AuthContext'; import { Spinner } from '../components/Spinner'; import { useToast } from '../components/Toast'

export default function SellerRegister() {
  const { user, refresh } = useAuth(); const navigate = useNavigate(); const { toast } = useToast()
  const [form, setForm] = useState({ name: '', city: '', phone: '', description: '' })
  const [loading, setLoading] = useState(false); const [err, setErr] = useState('')
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    try { await api.registerSeller(form); await refresh(); toast('Boutique créée !', 'success'); navigate('/seller') }
    catch(ex: any) { setErr(ex.response?.data?.message || 'Erreur') }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏪</div>
          <h1 style={{ fontSize: 26, fontWeight: 900 }}>Ouvrir ma boutique</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Vendez vos produits sur Selline et touchez des milliers de clients au Cameroun.</p>
        </div>
        <div className="card">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {err && <div className="alert alert-error">{err}</div>}
            <div className="input-group"><label>Nom de la boutique *</label><input className="input" value={form.name} onChange={set('name')} placeholder="Ex: Tech Mboa" required /></div>
            <div className="input-group"><label>Ville *</label><input className="input" value={form.city} onChange={set('city')} placeholder="Yaoundé, Douala…" required /></div>
            <div className="input-group"><label>Téléphone WhatsApp</label><input className="input" type="tel" value={form.phone} onChange={set('phone')} placeholder="6XX XX XX XX" /></div>
            <div className="input-group">
              <label>Description</label>
              <textarea className="input" value={form.description} onChange={set('description') as any} rows={3} placeholder="Décrivez votre boutique…" style={{ resize: 'vertical' }} />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>{loading ? <Spinner size={16} /> : 'Créer ma boutique'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
