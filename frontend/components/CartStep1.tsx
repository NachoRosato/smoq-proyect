import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/helpers'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Package, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import OptimizedImage from './OptimizedImage'
import Link from 'next/link'

interface CartStep1Props {
  onNext: () => void
}

export default function CartStep1({ onNext }: CartStep1Props) {
  const { state, updateQuantity, removeItem } = useCart()
  const [removingItem, setRemovingItem] = useState<string | null>(null)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(id, newQuantity)
  }

  const handleRemoveItem = async (id: string) => {
    setRemovingItem(id)
    setTimeout(() => {
      removeItem(id)
      setRemovingItem(null)
    }, 200)
  }

  const totalItems = state.items.reduce((sum, item) => sum + item.cantidad, 0)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-100 p-3 rounded-full">
            <ShoppingBag className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Tu Carrito de Compras
            </h2>
            <p className="text-gray-600">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'} en tu carrito
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Total del carrito</div>
          <div className="text-2xl font-bold text-primary-600">
            {formatPrice(state.total)}
          </div>
        </div>
      </div>

      {state.items.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 p-8 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tu carrito está vacío
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Parece que aún no has agregado ningún producto a tu carrito. 
            ¡Explora nuestra tienda y encuentra algo que te guste!
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Explorar Productos</span>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {state.items.map((item) => (
              <div 
                key={item.producto._id} 
                className={`group relative bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-primary-200 transition-all duration-300 ${
                  removingItem === item.producto._id ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                    <OptimizedImage
                      src={item.producto.imagen}
                      alt={item.producto.nombre}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      width={96}
                      height={96}
                    />
                    {item.cantidad > 1 && (
                      <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {item.cantidad}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {item.producto.nombre}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {item.producto.categoria}
                          </span>
                          {item.producto.stock < 5 && item.producto.stock > 0 && (
                            <span className="flex items-center text-orange-600">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Solo {item.producto.stock} disponibles
                            </span>
                          )}
                          {item.producto.stock === 0 && (
                            <span className="flex items-center text-red-600">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              Sin stock
                            </span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-primary-600">
                          {formatPrice(item.producto.precio)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                      <button
                        onClick={() => handleQuantityChange(item.producto._id, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-12 text-center font-semibold text-gray-900">
                        {item.cantidad}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.producto._id, item.cantidad + 1)}
                        disabled={item.cantidad >= item.producto.stock}
                        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="font-bold text-lg text-gray-900">
                        {formatPrice(item.producto.precio * item.cantidad)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.producto._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group-hover:bg-red-50"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resumen del pedido</h3>
                <p className="text-sm text-gray-600">
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'} seleccionados
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total a pagar</div>
                <div className="text-3xl font-bold text-primary-600">
                  {formatPrice(state.total)}
                </div>
              </div>
            </div>

            <button
              onClick={onNext}
              className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Continuar con el pedido</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
} 