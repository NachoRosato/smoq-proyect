import { useAgeVerification } from '../context/AgeVerificationContext'
import { RefreshCw } from 'lucide-react'

export default function ResetAgeVerification() {
  const { resetAgeVerification } = useAgeVerification()

  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres resetear la verificación de edad? Esto hará que aparezca el modal de verificación nuevamente.')) {
      resetAgeVerification()
      alert('Verificación de edad reseteada. El modal aparecerá en la próxima visita.')
    }
  }

  return (
    <button
      onClick={handleReset}
      className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200"
    >
      <RefreshCw className="w-4 h-4" />
      <span>Resetear Verificación de Edad</span>
    </button>
  )
} 