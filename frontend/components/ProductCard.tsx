import { ShoppingCart, Star, TrendingUp, Zap } from 'lucide-react'
import { formatPrice } from '../lib/helpers'
import OptimizedImage from './OptimizedImage'
import { useState } from 'react'

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

  const mainColor = 'rgb(124, 79, 0)';
  const mainColorDark = 'rgb(90, 57, 0)';
  const mainColorLight = 'rgba(124, 79, 0, 0.08)';

  const handleAdd = () => {
    if (producto.gustos && producto.gustos.length > 0 && !selectedGusto) {
      setError('Seleccioná un gusto para este producto')
      return
    }
    setError('')
    onAddToCart(selectedGusto)
  }

  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 relative border border-gray-100">
      {/* Gradiente de fondo marrón translúcido al hover */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to top, ${mainColorLight} 80%, transparent 100%)`, opacity: 1 }} />
      
      {/* Imagen con overlay mejorado */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <OptimizedImage
          src={producto.imagen}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          width={400}
          height={400}
        />
        {/* Overlay con información al hover */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(124,79,0,0.55) 70%, transparent 100%)', opacity: 0, transition: 'opacity 0.4s' }}></div>
        {/* Badge de stock */}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
              Sin stock
            </div>
          </div>
        )}
        {/* Badge de categoría mejorado */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-lg" style={{ background: mainColor, color: 'white' }}>
            {producto.categoria.nombre.charAt(0).toUpperCase() + producto.categoria.nombre.slice(1)}
          </span>
        </div>
        {/* Badge de nuevo producto */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-lg" style={{ background: mainColorDark, color: 'white' }}>
            <Zap className="w-3 h-3 mr-1" style={{ color: 'white' }} />
            Nuevo
          </span>
        </div>
      </div>
      {/* Contenido */}
      <div className="relative p-6">
        {/* Nombre */}
        <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-[rgb(124,79,0)] transition-colors duration-300">
          {producto.nombre}
        </h3>
        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {producto.descripcion}
        </p>
        {/* Select de gusto mejorado */}
        {producto.gustos && producto.gustos.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" style={{ color: mainColor }}>Seleccioná tu gusto</label>
            <select
              value={selectedGusto}
              onChange={e => setSelectedGusto(e.target.value)}
              className="w-full border-2 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 border-gray-200 bg-white hover:border-gray-300 transition-colors duration-300"
              style={{ color: mainColor, borderColor: mainColorLight, boxShadow: `0 0 0 2px ${mainColorLight}` }}
            >
              <option value="">Elegí un gusto</option>
              {producto.gustos.map(g => (
                <option key={g._id} value={g._id}>{g.nombre}</option>
              ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
          </div>
        )}
        {/* Precio y botón mejorados */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-3xl font-bold" style={{ color: mainColor }}>
            {formatPrice(producto.precio)}
          </div>
          <button
            onClick={handleAdd}
            disabled={producto.stock === 0}
            className={`group/btn relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
              producto.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : ''
            }`}
            style={producto.stock === 0 ? {} : { background: mainColor, color: 'white', boxShadow: `0 2px 12px 0 ${mainColorLight}` }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>{producto.stock === 0 ? 'Sin stock' : 'Agregar'}</span>
            </span>
          </button>
        </div>
        {/* Stock con icono */}
        {producto.stock > 0 && (
          <div className="flex items-center gap-2 text-sm" style={{ color: mainColor }}>
            <div className="w-2 h-2 rounded-full" style={{ background: mainColor }}></div>
            <span className="font-medium">Stock: {producto.stock} unidades</span>
          </div>
        )}
        {/* Información adicional */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs" style={{ color: mainColor }}>
            <span>🚚 Envío gratis</span>
            <span>⭐ 4.8/5</span>
          </div>
        </div>
      </div>
    </div>
  )
} 