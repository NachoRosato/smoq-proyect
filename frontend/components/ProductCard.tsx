import { ShoppingCart } from 'lucide-react'
import { formatPrice } from '../lib/helpers'
import OptimizedImage from './OptimizedImage'

interface Producto {
  _id: string
  nombre: string
  precio: number
  descripcion: string
  imagen: string
  categoria: string
  stock: number
}

interface ProductCardProps {
  producto: Producto
  onAddToCart: () => void
}

export default function ProductCard({ producto, onAddToCart }: ProductCardProps) {
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
            {producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
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

        {/* Precio y botón */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">
            {formatPrice(producto.precio)}
          </div>
          
          <button
            onClick={onAddToCart}
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