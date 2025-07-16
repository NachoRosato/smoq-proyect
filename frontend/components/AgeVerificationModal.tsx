import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface AgeVerificationModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

export default function AgeVerificationModal({ isOpen, onAccept, onDecline }: AgeVerificationModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden'
    } else {
      setIsVisible(false)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleAccept = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onAccept()
    }, 300)
  }

  const handleDecline = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onDecline()
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'opacity-80' : 'opacity-0'
        }`}
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.8) 100%)' }}
      />
      
      {/* Modal */}
      <div className={`relative z-10 w-full max-w-md mx-4 transform ${
        isAnimating ? 'animate-modal-fade-in' : 'animate-modal-fade-out'
      }`}>
        <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{
          background: 'linear-gradient(135deg, rgb(0 0 0) 0%, rgb(21 21 21) 50%, rgb(159, 129, 51) 100%)',
          border: '1px solid rgba(255, 219, 126, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 219, 126, 0.1)'
        }}>
          {/* Header con icono */}
          <div className="relative p-8 text-center">
            {/* Icono principal con efecto sutil */}
            <div className="relative mb-6">
              <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center relative" style={{
                background: 'linear-gradient(135deg, rgba(255, 219, 126, 0.15) 0%, rgba(255, 193, 7, 0.08) 100%)',
                border: '2px solid rgba(255, 219, 126, 0.3)'
              }}>
                <Shield className="w-10 h-10 text-amber-400" />
                {/* Efecto de respiración sutil */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white to-transparent animate-gentle-breath"></div>
              </div>
            </div>

            {/* Título */}
            <h2 className="text-2xl font-bold text-white mb-4">
              Verificación de Edad
            </h2>

            {/* Mensaje */}
            <div className="space-y-4 text-gray-200">
              <p className="text-lg leading-relaxed">
                Este sitio web contiene productos destinados únicamente para personas mayores de 18 años.
              </p>
              
              <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 border border-amber-400/20 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-100 leading-relaxed">
                    <strong>Importante:</strong> Al continuar, confirmas que eres mayor de 18 años y que tienes la edad legal para comprar estos productos en tu jurisdicción.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="px-8 pb-8 space-y-4">
            {/* Botón Aceptar */}
            <button
              onClick={handleAccept}
              className="w-full group relative overflow-hidden rounded-xl py-4 px-6 font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgb(147, 133, 90) 0%, rgb(159, 129, 51) 100%)',
                boxShadow: '0 8px 25px rgba(147, 133, 90, 0.25), 0 0 0 1px rgba(255, 219, 126, 0.1)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <CheckCircle className="w-5 h-5" />
                <span>Sí, soy mayor de 18 años</span>
              </div>
            </button>

            {/* Botón Rechazar */}
            <button
              onClick={handleDecline}
              className="w-full group relative overflow-hidden rounded-xl py-4 px-6 font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] border border-gray-500/30 hover:border-red-400/50 text-gray-300 hover:text-red-200 bg-gray-800/20 hover:bg-red-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <XCircle className="w-5 h-5" />
                <span>No, soy menor de edad</span>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6">
            <div className="border-t border-gray-700/30 pt-4">
              <p className="text-xs text-white text-center">
                Al continuar, aceptas nuestros términos y condiciones de uso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 