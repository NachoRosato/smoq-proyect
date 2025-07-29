import { useAgeVerification } from '../context/AgeVerificationContext'
import { RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function ResetAgeVerification() {
  const { resetAgeVerification } = useAgeVerification()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleReset = () => {
    setShowConfirmModal(true)
  }

  const confirmReset = () => {
    resetAgeVerification()
    setShowConfirmModal(false)
    setShowSuccessModal(true)
    
    // Ocultar el modal de éxito después de 3 segundos
    setTimeout(() => {
      setShowSuccessModal(false)
    }, 3000)
  }

  const cancelReset = () => {
    setShowConfirmModal(false)
  }

  return (
    <>
      <button
        onClick={handleReset}
        className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Resetear Verificación de Edad</span>
      </button>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-amber-100 mr-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirmar Reseteo</h3>
                <p className="text-sm text-gray-600">Verificación de edad</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que quieres resetear la verificación de edad? 
              Esto hará que aparezca el modal de verificación nuevamente en la próxima visita.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelReset}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReset}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">¡Reseteado!</h3>
                <p className="text-sm text-gray-600">Verificación de edad</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              La verificación de edad ha sido reseteada exitosamente. 
              El modal de verificación aparecerá en la próxima visita.
            </p>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 