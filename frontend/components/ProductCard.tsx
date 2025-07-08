import { ShoppingCart } from 'lucide-react'
import { formatPrice } from '../lib/helpers'
import OptimizedImage from './OptimizedImage'
import { useState } from 'react'

interface Gusto {
  _id: string
  nombre: string
  descripcion?: string
}

interface Producto {
  _id: string
  nombre: string
  precio: number
  descripcion: string
  imagen: string
  categoria: { _id: string; nombre: string }
  stock: number
  gustos?: { _id: string; nombre: string; descripcion?: string }[]
}

interface ProductCardProps {
  producto: Producto
  onAddToCart: (gustoId?: string) => void
}

export default function ProductCard({ producto, onAddToCart }: ProductCardProps) {
  const [selectedGusto, setSelectedGusto] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleAdd = () => {
    if (producto.gustos && producto.gustos.length > 0 && !selectedGusto) {
      setError('Seleccioná un gusto para este producto')
      return
    }
    setError('')
    onAddToCart(selectedGusto)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Imagen */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        <OptimizedImage
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          width={400}
          height={400}
        />
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Sin stock</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Categoría */}
        <div className="mb-2">
          <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
            {producto.categoria.nombre.charAt(0).toUpperCase() + producto.categoria.nombre.slice(1)}
          </span>
        </div>

        {/* Nombre */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {producto.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {producto.descripcion}
        </p>

        {/* Select de gusto si aplica */}
        {producto.gustos && producto.gustos.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-primary-800">Gusto</label>
            <select
              value={selectedGusto}
              onChange={e => setSelectedGusto(e.target.value)}
              className="w-full border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 border-yellow-400 text-primary-800 bg-white"
            >
              <option value="">Seleccioná un gusto</option>
              {producto.gustos.map(g => (
                <option key={g._id} value={g._id}>{g.nombre}</option>
              ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        )}

        {/* Precio y botón */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">
            {formatPrice(producto.precio)}
          </div>
          
          <button
            onClick={handleAdd}
            disabled={producto.stock === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              producto.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{producto.stock === 0 ? 'Sin stock' : 'Agregar'}</span>
          </button>
        </div>

        {/* Stock */}
        {producto.stock > 0 && (
          <div className="mt-2 text-sm text-gray-500">
            Stock: {producto.stock} unidades
          </div>
        )}
      </div>
    </div>
  )
} 