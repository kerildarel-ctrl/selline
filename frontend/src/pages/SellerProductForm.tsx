import { useState, useEffect } from 'react'; import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api'; import { Category } from '../types'; import { Spinner } from '../components/Spinner'; import { useToast } from '../components/Toast'; import { PageSpinner } from '../components/Spinner'

export default function SellerProductForm() {
  const { id } = useParams(); const navigate = useNavigate(); const { toast } = useToast()
  const isEdit = !!id && id !== 'new'
  const [cats, setCats] = useState<Category[]>([])
  const [form, setForm] = useState({ name: '', brand: '', description: '', price: '', stock: '', categoryId: '', freeShipping: true })
  const [loading, setLoading] = useState(isEdit); const [saving, setSaving] = useState(false); const [err, setErr] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  
  useEffect(() => { api.categories().then(setCats).catch(() => {}) }, [])
  useEffect(() => {
    if(isEdit) api.product(id!).then(p => {
      setForm({ name: p.name, brand: p.brand || '', description: p.description || '', price: String(p.price), stock: String(p.stock), categoryId: p.category?.id || '', freeShipping: p.freeShipping })
    }).catch(() => navigate('/seller/products')).finally(() => setLoading(false))
  }, [isEdit, id])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setSaving(true)
    try {
      const data = { ...form, price: Number(form.price), stock: Number(form.stock) }
      let prod
      if(isEdit) prod = await api.updateProduct(id!, data)
      else prod = await api.createProduct(data)
      if(imageFiles.length > 0) {
        const fd = new FormData(); imageFiles.forEach(f => fd.append('images', f))
        await api.uploadProductImages(prod.id, fd)
      }
      toast(isEdit ? 'Produit mis à jour !' : 'Produit créé !', 'success')
      navigate('/seller/products')
    } catch(ex: any) { setErr(ex.response?.data?.message || 'Erreur') }
    setSaving(false)
  }

  if(loading) return <PageSpinner />
  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>← Retour</button>
        <div className="card">
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>{isEdit ? '✏️ Modifier le produit' : '📦 Nouveau produit'}</h1>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {err && <div className="alert alert-error">{err}</div>}
            <div className="input-group"><label>Nom *</label><input className="input" value={form.name} onChange={set('name')} required /></div>
            <div className="input-group"><label>Marque</label><input className="input" value={form.brand} onChange={set('brand')} /></div>
            <div className="input-group"><label>Description</label>
              <textarea className="input" value={form.description} onChange={set('description') as any} rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="input-group"><label>Prix (XAF) *</label><input className="input" type="number" min={0} value={form.price} onChange={set('price')} required /></div>
              <div className="input-group"><label>Stock *</label><input className="input" type="number" min={0} value={form.stock} onChange={set('stock')} required /></div>
            </div>
            <div className="input-group">
              <label>Catégorie</label>
              <select className="input" value={form.categoryId} onChange={set('categoryId')}>
                <option value="">— Aucune —</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.freeShipping} onChange={set('freeShipping') as any} />
              <span>Livraison offerte</span>
            </label>
            <div className="input-group">
              <label>Images (optionnel)</label>
              <input type="file" accept="image/*" multiple onChange={e => setImageFiles(Array.from(e.target.files || []))} style={{ color: '#94a3b8', fontSize: 13 }} />
              {imageFiles.length > 0 && <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{imageFiles.length} image(s) sélectionnée(s)</p>}
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Spinner size={16} /> : isEdit ? 'Enregistrer' : 'Créer le produit'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
