import { useAgeVerification } from '../context/AgeVerificationContext'
import AgeVerificationModal from './AgeVerificationModal'
import { useRouter } from 'next/router'

interface AgeVerificationWrapperProps {
  children: React.ReactNode
}

export default function AgeVerificationWrapper({ children }: AgeVerificationWrapperProps) {
  const { isAgeVerified, showAgeVerification, verifyAge, declineAge } = useAgeVerification()
  const router = useRouter()

  // No mostrar el modal en páginas de admin
  const isAdminPage = router.pathname.startsWith('/admin')

  // Si es una página de admin, mostrar el contenido directamente
  if (isAdminPage) {
    return <>{children}</>
  }

  // Si la edad no está verificada, mostrar el modal
  if (!isAgeVerified && showAgeVerification) {
    return (
      <>
        <AgeVerificationModal
          isOpen={true}
          onAccept={verifyAge}
          onDecline={declineAge}
        />
        {/* Mostrar un overlay gris mientras se verifica la edad */}
        <div className="fixed inset-0 bg-gray-900 z-40" />
      </>
    )
  }

  // Si la edad está verificada, mostrar el contenido normal
  return <>{children}</>
} 