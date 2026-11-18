import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
type T = 'success'|'error'|'info'
interface Item { id: number; msg: string; type: T }
const Ctx = createContext<{ toast: (msg:string,type?:T)=>void }>(null!)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Item[]>([])
  const toast = useCallback((msg: string, type: T = 'info') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }, [])
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>)}
      </div>
    </Ctx.Provider>
  )
}
export const useToast = () => useContext(Ctx)
