import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/helpers'
import OptimizedImage from './OptimizedImage'

interface CartItemProps {
  item: {
    producto: {
      _id: string
      nombre: string
      precio: number
      imagen: string
      categoria: string
    }
    cantidad: number
  }
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.producto._id, newQuantity)
  }

  const handleRemove = () => {
    removeItem(item.producto._id)
  }

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg bg-white">
      {/* Imagen */}
      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
        <OptimizedImage
          src={item.producto.imagen}
          alt={item.producto.nombre}
          className="w-16 h-16 object-cover rounded-lg"
          width={64}
          height={64}
        />
      </div>

      {/* Información del producto */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {item.producto.nombre}
        </h3>
        <p className="text-sm text-gray-600">
          {item.producto.categoria}
        </p>
        <p className="text-lg font-bold text-primary-600">
          {formatPrice(item.producto.precio)}
        </p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleQuantityChange(item.cantidad - 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={item.cantidad <= 1}
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <span className="w-12 text-center font-medium">
          {item.cantidad}
        </span>
        
        <button
          onClick={() => handleQuantityChange(item.cantidad + 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="font-semibold text-gray-900">
          {formatPrice(item.producto.precio * item.cantidad)}
        </p>
      </div>

      {/* Botón eliminar */}
      <button
        onClick={handleRemove}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Eliminar producto"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )
} 