import { createContext, useContext, useState, ReactNode } from 'react'
import { CartItem, Product } from '../types'
interface CartCtx { items: CartItem[]; add: (p: Product, q: number) => void; remove: (id: string) => void; update: (id: string, q: number) => void; clear: () => void; total: number; count: number }
const Ctx = createContext<CartCtx>(null!)
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => { try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch { return [] } })
  const save = (n: CartItem[]) => { setItems(n); localStorage.setItem('cart', JSON.stringify(n)) }
  const add = (product: Product, qty: number) => { const ex = items.find(i => i.product.id === product.id); ex ? save(items.map(i => i.product.id === product.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i)) : save([...items, { product, qty: Math.min(qty, 99) }]) }
  const remove = (id: string) => save(items.filter(i => i.product.id !== id))
  const update = (id: string, qty: number) => qty <= 0 ? remove(id) : save(items.map(i => i.product.id === id ? { ...i, qty: Math.min(qty, 99) } : i))
  const clear = () => save([])
  return <Ctx.Provider value={{ items, add, remove, update, clear, total: items.reduce((s, i) => s + i.product.price * i.qty, 0), count: items.reduce((s, i) => s + i.qty, 0) }}>{children}</Ctx.Provider>
}
export const useCart = () => useContext(Ctx)
