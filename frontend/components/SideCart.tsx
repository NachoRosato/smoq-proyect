import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/helpers'
import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import OptimizedImage from './OptimizedImage'
import { configApi } from '../utils/api'

interface Gusto {
  _id: string
  nombre: string
  descripcion?: string
}

interface SideCartProps {
  isOpen: boolean
  onClose: () => void
  minFreeShipping: number
  onCheckout: () => void
}

export default function SideCart({ isOpen, onClose, onCheckout }: Omit<SideCartProps, 'minFreeShipping'>) {
  const { state, updateQuantity, removeItem } = useCart()
  const [minFreeShipping, setMinFreeShipping] = useState(25000)
  const cartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    configApi.get().then(res => {
      if (res.success && res.config) {
        setMinFreeShipping(res.config.minFreeShipping)
      } else {
        console.warn('No se pudo obtener configuración, usando valor por defecto')
        setMinFreeShipping(25000)
      }
    }).catch(error => {
      console.warn('Error obteniendo configuración:', error)
      setMinFreeShipping(25000)
    })
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Cerrar al click fuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, onClose])

  const subtotal = state.items.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)
  const descuentos = 0 // Aquí puedes sumar descuentos si tienes lógica
  const total = subtotal - descuentos
  const faltante = Math.max(0, minFreeShipping - total)
  const progreso = Math.min(100, (total / minFreeShipping) * 100)

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
      {/* Side Cart */}
      <div
        ref={cartRef}
        className={`relative w-full max-w-md h-full shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{
          background: 'rgb(224 217 190)',
          border: 'none'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ border: 'none' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'black' }}>
            <ShoppingCart className="w-7 h-7" style={{ color: '#7C4F00' }} /> Tu Carrito
          </h2>
          <button onClick={onClose} className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-amber-100" style={{ color: '#7C4F00' }}>
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Barra de progreso animada */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex justify-between items-center mb-1 text-sm font-medium" style={{ color: 'black' }}>
            <span>
              {faltante > 0
                ? <>Agregá {formatPrice(faltante)} más y obtené <b style={{ color: 'white' }}>envío GRATIS</b></>
                : <span className="font-bold" style={{ color: '#2E7D32' }}>¡Ya tenés envío GRATIS! 🎉</span>
              }
            </span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#fff8e6' }}>
            <div
              className="h-full transition-[width] duration-700"
              style={{ width: `${progreso}%`, background: 'linear-gradient(to right, rgb(209 159 82), rgb(0, 0, 0))' }}
            />
          </div>
        </div>

        {/* Lista de productos mejorada */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {state.items.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'black' }}>
              <ShoppingCart className="w-12 h-12 mx-auto mb-4" style={{ color: '#7C4F00' }} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            state.items.map(item => (
              <div 
                key={item.producto._id + (item.gustoId || '')} 
                className="flex items-center gap-4 rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #FFF9E1, #FFF1B8)', 
                  border: '1px solid rgba(255, 219, 126, 0.3)',
                  boxShadow: '0 2px 8px rgba(124, 79, 0, 0.1)'
                }}
              >
                <div className="relative">
                  <OptimizedImage
                    src={item.producto.imagen}
                    alt={item.producto.nombre}
                    width={72}
                    height={72}
                    className="rounded-lg object-cover w-18 h-18 shadow-md"
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'rgb(124, 79, 0)' }}>
                    {item.cantidad}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate mb-1" style={{ color: 'black' }}>{item.producto.nombre}</div>
                  <div className="text-xs mb-2 px-2 py-1 rounded-full inline-block" style={{ background: 'rgba(255, 184, 76, 0.2)', color: '#B88C3A' }}>
                    {item.producto.categoria && item.producto.categoria.nombre ? item.producto.categoria.nombre : 'Sin categoría'}
                  </div>
                  {item.gustoId && (
                    <div className="text-xs mb-2 px-2 py-1 rounded-full inline-block" style={{ background: 'rgba(255, 184, 76, 0.2)', color: '#B88C3A' }}>
                      Sabor: {Array.isArray(item.producto.gustos) ? item.producto.gustos.find((g: Gusto) => g._id === item.gustoId)?.nombre || 'Sin especificar' : 'Sin especificar'}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mt-3">
                    <button 
                      onClick={() => updateQuantity(item.producto._id, item.gustoId, item.cantidad - 1)} 
                      disabled={item.cantidad <= 1} 
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed" 
                      style={{ 
                        border: '2px solid #FFDB7E', 
                        color: '#B88C3A', 
                        background: item.cantidad <= 1 ? 'rgba(255, 219, 126, 0.3)' : '#FFF1B8'
                      }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-lg" style={{ color: '#7C4F00' }}>{item.cantidad}</span>
                    <button 
                      onClick={() => updateQuantity(item.producto._id, item.gustoId, item.cantidad + 1)} 
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110" 
                      style={{ 
                        border: '2px solid #FFDB7E', 
                        color: '#B88C3A', 
                        background: '#FFF1B8'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-lg" style={{ color: '#7C4F00' }}>{formatPrice(item.producto.precio * item.cantidad)}</span>
                  <button 
                    onClick={() => removeItem(item.producto._id, item.gustoId)} 
                    className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-red-100" 
                    style={{ color: '#B88C3A' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t" style={{ borderTop: '2px solid white', background: 'rgba(255,249,225,0.95)' }}>
          <div className="flex justify-between items-center mb-2">
            <span style={{ color: 'black' }}>Descuentos</span>
            <span className="font-semibold" style={{ color: 'black' }}>{formatPrice(descuentos)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold mb-4">
            <span style={{ color: '#7C4F00' }}>Subtotal</span>
            <span style={{ color: '#7C4F00' }}>{formatPrice(total)}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:bg-gray-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={state.items.length === 0}
          >
            FINALIZAR COMPRA
          </button>
        </div>
      </div>
    </div>
  )
} 