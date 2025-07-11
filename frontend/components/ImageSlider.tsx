import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import OptimizedImage from './OptimizedImage'

interface ImageSliderProps {
  images: string[]
  alt: string
  className?: string
  showDots?: boolean
  showArrows?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export default function ImageSlider({
  images,
  alt,
  className = '',
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 3000
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
      }, autoPlayInterval)
      return () => clearInterval(interval)
    }
  }, [autoPlay, images.length, autoPlayInterval])

  const goToNext = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToPrevious = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 300)
  }

  // Funciones para swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext()
    }
    if (isRightSwipe) {
      goToPrevious()
    }
  }

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (images.length <= 1) return
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          event.preventDefault()
          goToNext()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [images.length])

  if (!images || images.length === 0) {
    return null
  }

  // Si solo hay una imagen, mostrar sin controles
  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden rounded-xl ${className}`}>
        <OptimizedImage
          src={images[0]}
          alt={alt}
          width={400}
          height={400}
          className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
        />
      </div>
    )
  }

  return (
    <div 
      className={`relative overflow-hidden rounded-xl group ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Imagen principal con efecto de transición */}
      <div className="relative w-full h-full">
        <img
          key={`${currentIndex}-${images[currentIndex]}`}
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1} de ${images.length}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out hover:scale-110 ${
            isTransitioning ? 'scale-105 opacity-90' : 'scale-100 opacity-100'
          }`}
        />
        
        {/* Overlay gradiente sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Flechas de navegación mejoradas */}
      {showArrows && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-2 opacity-0 group-hover:opacity-100 z-10 cursor-pointer transition-all duration-300 hover:scale-110"
            aria-label="Imagen anterior"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/5 transition-all duration-300 hover:shadow-md">
              <ChevronLeft className="w-4 h-4 transition-transform duration-200 hover:-translate-x-1" />
            </div>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 p-2 opacity-0 group-hover:opacity-100 z-10 cursor-pointer transition-all duration-300 hover:scale-110"
            aria-label="Imagen siguiente"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-sm border border-white/5 transition-all duration-300 hover:shadow-md">
              <ChevronRight className="w-4 h-4 transition-transform duration-200 hover:translate-x-1" />
            </div>
          </button>
        </>
      )}

      {/* Indicadores de puntos mejorados */}
      {showDots && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white rounded-full shadow-lg'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80 rounded-full hover:scale-125'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
              type="button"
            />
          ))}
        </div>
      )}

      {/* Contador de imágenes mejorado */}
      <div className="absolute top-3 right-3 bg-black/25 backdrop-blur-sm text-white/80 text-xs px-3 py-1.5 rounded-full z-10 border border-white/5 shadow-sm">
        <span className="font-medium">{currentIndex + 1}</span>
        <span className="text-white/50"> / {images.length}</span>
      </div>


    </div>
  )
} 