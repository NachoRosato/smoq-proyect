import { createContext, useContext, useState, ReactNode } from 'react'

interface SideCartContextType {
  isOpen: boolean
  open: () => void
  close: () => void
}

const SideCartContext = createContext<SideCartContextType | undefined>(undefined)

export function SideCartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  return (
    <SideCartContext.Provider value={{ isOpen, open, close }}>
      {children}
    </SideCartContext.Provider>
  )
}

export function useSideCart() {
  const ctx = useContext(SideCartContext)
  if (!ctx) throw new Error('useSideCart debe usarse dentro de SideCartProvider')
  return ctx
} 