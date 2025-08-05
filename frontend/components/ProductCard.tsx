import { ShoppingCart, Zap } from 'lucide-react'
import { formatPrice, getStockForGusto } from '../lib/helpers'
import ImageSlider from './ImageSlider'
import { useState } from 'react'
import { Producto } from '../types/product'

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

  // Función para verificar si el producto es nuevo (menos de 15 días)
  const isProductNew = () => {
    const now = new Date()
    const productDate = new Date(producto.updatedAt || producto.createdAt || now)
    const daysDifference = (now.getTime() - productDate.getTime()) / (1000 * 3600 * 24)
    return daysDifference <= 15
  }

  // Función para verificar si hay stock disponible
  const isAvailable = () => {
    if (producto.gustos && producto.gustos.length > 0) {
      // Si tiene gustos, verificar stock por gusto
      if (producto.stockPorGusto && producto.stockPorGusto.length > 0) {
        return producto.stockPorGusto.some(sg => sg.stock > 0)
      }
      // Si no tiene stock por gusto, usar stock general
      return producto.stock > 0
    }
    // Si no tiene gustos, usar stock general
    return producto.stock > 0
  }

  // Obtener las imágenes del producto (múltiples o una sola)
  const getProductImages = () => {
    if (producto.imagenes && producto.imagenes.length > 0) {
      return producto.imagenes;
    }
    return [producto.imagen];
  };

  // Obtener el stock del gusto seleccionado
  const getStockForGustoLocal = (gustoId: string) => {
    return getStockForGusto(producto, gustoId);
  };



  const handleAdd = () => {
    if (producto.gustos && producto.gustos.length > 0 && !selectedGusto) {
      setError('Seleccioná un gusto para este producto')
      return
    }
    
    // Verificar stock específico si hay gusto seleccionado
    if (producto.gustos && producto.gustos.length > 0 && selectedGusto) {
      const stockGusto = getStockForGustoLocal(selectedGusto);
      if (stockGusto <= 0) {
        setError('Este gusto no tiene stock disponible')
        return
      }
    }
    
    setError('')
    onAddToCart(selectedGusto)
  }

  const handleGustoChange = (gustoId: string) => {
    setSelectedGusto(gustoId);
    setError('');
  };


  const productImages = getProductImages();

  return (
    <div className="group rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative h-full flex flex-col" style={{ backgroundColor: 'rgb(243, 240, 235)' }}>
      {/* Imagen con overlay mejorado */}
      <div className="aspect-square relative overflow-hidden flex-shrink-0">
        {/* Overlay sutil en hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 z-10 pointer-events-none"></div>
        <ImageSlider
          images={productImages}
          alt={producto.nombre}
          className="w-full h-full"
          showDots={productImages.length > 1}
          showArrows={productImages.length > 1}
        />
        {/* Badge de stock */}
        {!isAvailable() && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
              Sin stock
            </div>
          </div>
        )}
        {/* Badge de categoría mejorado */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-lg" style={{ background: mainColor, color: 'white' }}>
            {producto.categoria && producto.categoria.nombre ? producto.categoria.nombre.charAt(0).toUpperCase() + producto.categoria.nombre.slice(1) : 'Sin categoría'}
          </span>
        </div>
        {/* Badge de nuevo producto - movido a esquina inferior derecha */}
        {isProductNew() && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold shadow-lg" style={{ background: mainColorDark, color: 'white' }}>
              <Zap className="w-3 h-3 mr-1" style={{ color: 'white' }} />
              Nuevo
            </span>
          </div>
        )}
      </div>
      
      {/* Contenido optimizado */}
      <div className="relative p-4 z-10 flex-1 flex flex-col">
        {/* Header con nombre y precio */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold line-clamp-2 flex-1 mr-3 min-w-0 leading-tight">
            {producto.nombre}
          </h3>
          <div className="text-right flex-shrink-0 ml-2">
            {producto.tieneDescuento ? (
              <div className="flex flex-col items-end">
                <span className="line-through text-gray-400 text-sm">
                  {formatPrice(producto.precioOriginal || producto.precio)}
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(producto.precioConDescuento || producto.precio)}
                </span>
                <span className="text-xs text-red-600 font-medium">
                  -{producto.descuentoPorcentaje}% OFF
                </span>
              </div>
            ) : (
              <div className="text-2xl font-bold" style={{ color: mainColor }}>
                {formatPrice(producto.precio)}
              </div>
            )}
          </div>
        </div>
        
        {/* Descripción compacta */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {producto.descripcion}
        </p>
        
        {/* Select de gusto compacto */}
        {producto.gustos && producto.gustos.length > 0 && (
          <div className="mb-3">
            <select
              value={selectedGusto}
              onChange={e => handleGustoChange(e.target.value)}
              className="w-full border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 bg-white transition-all duration-300 text-sm cursor-pointer hover:border-gray-300 hover:shadow-md"
              style={{ 
                color: mainColor, 
                borderColor: mainColorLight, 
                boxShadow: `0 0 0 2px ${mainColorLight}`
              }}
            >
              <option value="">Elegí un gusto</option>
              {producto.gustos.map(g => (
                <option key={g._id} value={g._id}>{g.nombre}</option>
              ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
          </div>
        )}
        
        {/* Footer con botón y stock */}
        <div className="flex items-center justify-between mt-auto pt-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Stock info */}
            <div className="flex items-center gap-1.5 text-xs flex-shrink-0" style={{ color: isAvailable() ? mainColor : '#EF4444' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: isAvailable() ? mainColor : '#EF4444' }}></div>
              <span className="font-medium">{isAvailable() ? 'Disponible' : 'No disponible'}</span>
            </div>
            {/* Info adicional compacta */}
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
              <span>🚚 Gratis</span>
              <span>⭐ 4.8</span>
            </div>
          </div>
          
          {/* Botón de agregar */}
          <button
            onClick={handleAdd}
            disabled={!isAvailable()}
            className={`group/btn relative px-4 py-2 rounded-lg font-semibold overflow-hidden text-sm flex-shrink-0 min-w-[80px] transition-all duration-300 hover:scale-105 ${
              !isAvailable()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : ''
            }`}
            style={!isAvailable() ? {} : { background: mainColor, color: 'white', boxShadow: `0 2px 12px 0 ${mainColorLight}` }}
          >
            <span className="relative z-10 flex items-center gap-1.5 justify-center">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{!isAvailable() ? 'Sin stock' : 'Agregar'}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
} 