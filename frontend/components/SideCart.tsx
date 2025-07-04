import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/helpers'
import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import OptimizedImage from './OptimizedImage'
import { configApi } from '../utils/api'

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
        className={`relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary-600" /> Tu Carrito
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Barra de progreso animada */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex justify-between items-center mb-1 text-sm font-medium">
            <span>
              {faltante > 0
                ? <>Agregá {formatPrice(faltante)} más y obtené <b>envío GRATIS</b></>
                : <span className="text-green-600 font-bold">¡Ya tenés envío GRATIS! 🎉</span>
              }
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {state.items.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-primary-200" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            state.items.map(item => (
              <div key={item.producto._id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 shadow-sm">
                <OptimizedImage
                  src={item.producto.imagen}
                  alt={item.producto.nombre}
                  width={64}
                  height={64}
                  className="rounded-lg object-cover w-16 h-16"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{item.producto.nombre}</div>
                  <div className="text-xs text-gray-500 mb-1">{item.producto.categoria}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.producto._id, item.cantidad - 1)} disabled={item.cantidad <= 1} className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.cantidad}</span>
                    <button onClick={() => updateQuantity(item.producto._id, item.cantidad + 1)} className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-primary-600">{formatPrice(item.producto.precio * item.cantidad)}</span>
                  <button onClick={() => removeItem(item.producto._id)} className="text-red-400 hover:text-red-600 mt-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500">Descuentos</span>
            <span className="text-red-500 font-semibold">{formatPrice(descuentos)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold mb-4">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors shadow-lg"
            disabled={state.items.length === 0}
          >
            FINALIZAR COMPRA
          </button>
        </div>
      </div>
    </div>
  )
} 