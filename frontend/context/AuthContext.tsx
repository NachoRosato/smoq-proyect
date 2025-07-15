import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  _id: string
  email: string
  nombre: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

interface AuthContextType {
  auth: AuthState
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  showTokenExpiredModal: boolean
  setShowTokenExpiredModal: (show: boolean) => void
  handleTokenExpired: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  })
  const [loading, setLoading] = useState(true)
  const [showTokenExpiredModal, setShowTokenExpiredModal] = useState(false)

  // Cargar sesión desde localStorage al inicializar
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const user = localStorage.getItem('admin_user')
    
    if (token && user) {
      try {
        setAuth({
          user: JSON.parse(user),
          token,
          isAuthenticated: true
        })
      } catch (error) {
        console.error('Error al cargar sesión:', error)
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://smoq-proyect-production.up.railway.app'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        const authData = {
          user: data.user,
          token: data.token,
          isAuthenticated: true
        }
        
        setAuth(authData)
        localStorage.setItem('admin_token', data.token)
        localStorage.setItem('admin_user', JSON.stringify(data.user))
        return true
      }
      return false
    } catch (error) {
      console.error('Error en login:', error)
      return false
    }
  }

  const logout = () => {
    setAuth({
      user: null,
      token: null,
      isAuthenticated: false
    })
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setShowTokenExpiredModal(false)
  }

  const handleTokenExpired = () => {
    setShowTokenExpiredModal(true)
  }

  return (
    <AuthContext.Provider value={{ 
      auth, 
      login, 
      logout, 
      loading, 
      showTokenExpiredModal, 
      setShowTokenExpiredModal,
      handleTokenExpired
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
} 