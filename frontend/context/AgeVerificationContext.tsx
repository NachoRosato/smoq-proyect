import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AgeVerificationContextType {
  isAgeVerified: boolean
  showAgeVerification: boolean
  verifyAge: () => void
  declineAge: () => void
  resetAgeVerification: () => void
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined)

export function AgeVerificationProvider({ children }: { children: ReactNode }) {
  const [isAgeVerified, setIsAgeVerified] = useState(false)
  const [showAgeVerification, setShowAgeVerification] = useState(false)

  // Cargar estado desde localStorage al inicializar
  useEffect(() => {
    const savedVerification = localStorage.getItem('ageVerification')
    if (savedVerification === 'verified') {
      setIsAgeVerified(true)
    } else {
      setShowAgeVerification(true)
    }
  }, [])

  const verifyAge = () => {
    setIsAgeVerified(true)
    setShowAgeVerification(false)
    localStorage.setItem('ageVerification', 'verified')
  }

  const declineAge = () => {
    // Redirigir a Google
    window.location.href = 'https://www.google.com'
  }

  const resetAgeVerification = () => {
    setIsAgeVerified(false)
    setShowAgeVerification(true)
    localStorage.removeItem('ageVerification')
  }

  const value = {
    isAgeVerified,
    showAgeVerification,
    verifyAge,
    declineAge,
    resetAgeVerification
  }

  return (
    <AgeVerificationContext.Provider value={value}>
      {children}
    </AgeVerificationContext.Provider>
  )
}

export function useAgeVerification() {
  const context = useContext(AgeVerificationContext)
  if (context === undefined) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider')
  }
  return context
} 