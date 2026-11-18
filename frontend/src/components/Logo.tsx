import { Link } from 'react-router-dom'
export function Logo({ size = 'md' }: { size?: 'sm'|'md'|'lg' }) {
  const sz = { sm: 18, md: 22, lg: 30 }[size]
  return (
    <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap: 8, textDecoration:'none' }}>
      <div style={{ width: sz*1.6, height: sz*1.6, borderRadius: 8, background:'linear-gradient(135deg,#facc15,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize: sz, color:'#0f172a', flexShrink:0 }}>S</div>
      <span style={{ fontWeight:900, fontSize: sz, color:'#fff', letterSpacing:'-0.5px' }}>selline</span>
    </Link>
  )
}
