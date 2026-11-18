export function Spinner({ size = 20 }: { size?: number }) {
  return <div className="spinner" style={{ width: size, height: size }} />
}
export function PageSpinner() {
  return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}><Spinner size={36} /></div>
}
