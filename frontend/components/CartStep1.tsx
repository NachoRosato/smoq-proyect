import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/helpers'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Package, CheckCircle } from 'lucide-react'
import OptimizedImage from './OptimizedImage'
import Link from 'next/link'

interface CartStep1Props {
  onNext: () => void
}

export default function CartStep1({ onNext }: CartStep1Props) {
  const { state, updateQuantity, removeItem } = useCart()

  const handleQuantityChange = (id: string, gustoId: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(id, gustoId, newQuantity)
  }

  const handleRemoveItem = async (id: string, gustoId?: string) => {
    removeItem(id, gustoId)
  }

  const totalItems = state.items.reduce((sum, item) => sum + item.cantidad, 0)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header elegante */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, rgb(255, 249, 225), rgb(255, 241, 184))' }}>
              <ShoppingBag className="w-6 h-6" style={{ color: 'rgb(124, 79, 0)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Tu Carrito de Compras</h2>
              <p className="text-gray-600 flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} seleccionados
              </p>
            </div>
          </div>
          <div className="text-center lg:text-right">
            <div className="text-sm text-gray-500 mb-1">Total del carrito</div>
            <div className="text-3xl font-bold text-black">
              {formatPrice(state.total)}
            </div>
          </div>
        </div>
      </div>

      {state.items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgb(255, 249, 225), rgb(255, 241, 184))' }}>
            <Package className="w-8 h-8" style={{ color: 'rgb(124, 79, 0)' }} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Tu carrito está vacío
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
            Parece que aún no has agregado ningún producto a tu carrito. 
            ¡Explora nuestra tienda y encuentra algo que te guste!
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explorar Productos</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Lista de productos rediseñada */}
          <div className="space-y-3 mb-6">
            {state.items.map((item) => (
              <div
                key={item.producto._id + (item.gustoId || '')}
                className="bg-white rounded-xl shadow-lg p-4 transition-all duration-300 hover:shadow-xl border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Imagen con badge de cantidad */}
                  <div className="relative flex-shrink-0">
                    <OptimizedImage
                      src={item.producto.imagen}
                      alt={item.producto.nombre}
                      className="rounded-lg object-cover w-16 h-16 shadow-md"
                      width={64}
                      height={64}
                    />
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'rgb(124, 79, 0)' }}>
                      {item.cantidad}
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center w-full text-center sm:text-left">
                    <div className="font-bold text-base truncate mb-1 text-black">
                      {item.producto.nombre}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2 justify-center sm:justify-start">
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255, 184, 76, 0.2)', color: 'rgb(184, 140, 58)' }}>
                        {item.producto.categoria && item.producto.categoria.nombre ? item.producto.categoria.nombre : 'Sin categoría'}
                      </span>
                      {item.gustoId && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255, 184, 76, 0.2)', color: 'rgb(184, 140, 58)' }}>
                          {Array.isArray(item.producto.gustos) ? item.producto.gustos.find((g: any) => g._id === item.gustoId)?.nombre || 'Sin especificar' : 'Sin especificar'}
                        </span>
                      )}
                    </div>
                    
                    {/* Controles de cantidad */}
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.producto._id, item.gustoId, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          border: '2px solid rgb(255, 219, 126)', 
                          color: 'rgb(124, 79, 0)', 
                          background: item.cantidad <= 1 ? 'rgba(255, 219, 126, 0.3)' : 'rgb(255, 241, 184)'
                        }}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-base text-black">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.producto._id, item.gustoId, item.cantidad + 1)}
                        disabled={item.cantidad >= item.producto.stock}
                        className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
                        style={{ 
                          border: '2px solid rgb(255, 219, 126)', 
                          color: 'rgb(124, 79, 0)', 
                          background: 'rgb(255, 241, 184)'
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Precio y botón eliminar */}
                  <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                    {item.producto.tieneDescuento ? (
                      <div className="text-center sm:text-right">
                        <span className="line-through text-gray-400 text-sm">
                          {formatPrice((item.producto.precioOriginal || item.producto.precio) * item.cantidad)}
                        </span>
                        <div className="font-bold text-lg text-red-600">
                          {formatPrice((item.producto.precioConDescuento || item.producto.precio) * item.cantidad)}
                        </div>
                        <span className="text-xs text-red-600 font-medium">
                          -{item.producto.descuentoPorcentaje}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-lg" style={{ color: 'rgb(124, 79, 0)' }}>
                        {formatPrice((item.producto.precioConDescuento || item.producto.precio) * item.cantidad)}
                      </span>
                    )}
                    <button
                      className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-red-100 group"
                      style={{ color: 'rgb(124, 79, 0)' }}
                      onClick={() => handleRemoveItem(item.producto._id, item.gustoId)}
                    >
                      <Trash2 className="w-4 h-4 group-hover:text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido rediseñado */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Resumen del pedido</h3>
                <p className="text-gray-600 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'} seleccionados
                </p>
              </div>
              <div className="text-center lg:text-right">
                <div className="text-sm text-gray-500 mb-1">Total a pagar</div>
                <div className="text-3xl font-bold text-black">
                  {formatPrice(state.total)}
                </div>
              </div>
            </div>

            <button
              onClick={onNext}
              className="w-full bg-black text-white py-4 px-6 rounded-xl hover:bg-gray-800 transition-all duration-300 font-bold text-base flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105"
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