import { useState, useEffect } from 'react'; import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../api'; import { Product, Category } from '../types'
import { ProductCard } from '../components/ProductCard'; import { PageSpinner } from '../components/Spinner'

export default function Products() {
  const [sp, setSp] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [total, setTotal] = useState(0); const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const q = sp.get('q')||''; const catId = sp.get('category')||''; const sort = sp.get('sort')||'recent'
  const freeShipping = sp.get('freeShipping')==='1'; const verified = sp.get('verified')==='1'

  useEffect(() => { api.categories().then(setCats).catch(()=>{}) }, [])
  useEffect(() => { load(1) }, [sp])

  const load = async (p:number) => {
    setLoading(true); setPage(p)
    try {
      const r = await api.products({ q, category:catId, sort, freeShipping:freeShipping||undefined, verified:verified||undefined, page:p, limit:24 })
      setProducts(r.products); setTotal(r.total)
    } catch {}
    setLoading(false)
  }

  const setFilter = (key:string, val:string|null) => {
    const n = new URLSearchParams(sp)
    if(val) n.set(key, val); else n.delete(key)
    setSp(n)
  }

  const pages = Math.ceil(total/24)

  return (
    <div className="page">
      <div className="container">
        {/* Search bar */}
        <div style={{ marginBottom:16 }}>
          <form onSubmit={e=>{e.preventDefault();const f=new FormData(e.target as HTMLFormElement);setFilter('q',f.get('q') as string)}}
            style={{ display:'flex', gap:8 }}>
            <input name="q" defaultValue={q} className="input" placeholder="Rechercher un produit…" style={{ flex:1 }} />
            <button className="btn btn-primary">Chercher</button>
          </form>
        </div>

        {/* Cats */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', marginBottom:16, paddingBottom:4, scrollbarWidth:'none' }}>
          <button onClick={()=>setFilter('category',null)} style={{ flexShrink:0, padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:600, border:`1px solid ${!catId?'#facc15':'rgba(255,255,255,.1)'}`, background:!catId?'#facc15':'transparent', color:!catId?'#0f172a':'#94a3b8', cursor:'pointer' }}>Tout</button>
          {cats.map(c => <button key={c.id} onClick={()=>setFilter('category',c.id)} style={{ flexShrink:0, padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:600, border:`1px solid ${catId===c.id?'#facc15':'rgba(255,255,255,.1)'}`, background:catId===c.id?'#facc15':'transparent', color:catId===c.id?'#0f172a':'#94a3b8', cursor:'pointer' }}>{c.name}</button>)}
        </div>

        {/* Filters row */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center', marginBottom:20 }}>
          <select value={sort} onChange={e=>setFilter('sort',e.target.value)} className="input" style={{ width:'auto', padding:'7px 12px', fontSize:13 }}>
            <option value="recent">Plus récents</option>
            <option value="price_asc">Prix ↑</option>
            <option value="price_desc">Prix ↓</option>
            <option value="popular">Populaires</option>
          </select>
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#64748b', cursor:'pointer' }}>
            <input type="checkbox" checked={freeShipping} onChange={e=>setFilter('freeShipping',e.target.checked?'1':null)} />
            Livraison offerte
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#64748b', cursor:'pointer' }}>
            <input type="checkbox" checked={verified} onChange={e=>setFilter('verified',e.target.checked?'1':null)} />
            Vendeurs vérifiés
          </label>
          {total > 0 && <span style={{ marginLeft:'auto', fontSize:12, color:'#475569' }}>{total} produit{total>1?'s':''}</span>}
        </div>

        {loading ? <PageSpinner /> : products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'#475569' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <p>Aucun produit trouvé.</p>
          </div>
        ) : (
          <>
            <div className="products-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>
            {pages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:32 }}>
                {page > 1 && <button className="btn btn-dark btn-sm" onClick={()=>load(page-1)}>← Précédent</button>}
                <span style={{ padding:'6px 16px', fontSize:13, color:'#64748b' }}>{page}/{pages}</span>
                {page < pages && <button className="btn btn-dark btn-sm" onClick={()=>load(page+1)}>Suivant →</button>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
