import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { LogOut, Package, Home, MessageCircle, Settings, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSidebar } from '../context/SidebarContext'

interface AdminLayoutProps {
  children: React.ReactNode
}

function AdminLayoutInner({ children }: AdminLayoutProps) {
  const { auth, logout, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const { sidebarOpen, setSidebarOpen } = useSidebar()

  useEffect(() => {
    if (!loading) {
      if (!auth.isAuthenticated) {
        router.push('/admin/login')
      } else {
        setIsLoading(false)
      }
    }
  }, [auth, router, loading])

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const toggleSidebar = () => {
    setIsRotating(true)
    setSidebarOpen(!sidebarOpen)
    setTimeout(() => setIsRotating(false), 400)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return null
  }

  if (!hasMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${
        sidebarOpen ? 'w-64' : 'w-0'
      } transition-[width] duration-300 ease-in-out`}>
        <div className={`h-full bg-white shadow-lg overflow-hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300 ease-in-out`} style={{
          background: 'linear-gradient(to right, white 0%, rgb(255 249 225) 20%, rgb(255 241 184) 50%, rgb(255 219 126) 100%)'
        }}>
              {/* Botón para ocultar/mostrar sidebar */}
            <button
              onClick={toggleSidebar}
              style={{ background: 'rgb(96 70 41)' }}
              className="absolute -right-3 top-16 transform -translate-y-1/2 w-8 h-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center z-[1]"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'} ${isRotating ? 'animate-spin-slow' : ''}`} color="#fff" />
            </button>
          <div className="flex items-center justify-center h-16 px-4 border-b border-white relative">
            <Image
              src="/images/logo_empresa.png"
              alt="Logo de la empresa"
              width={120}
              height={40}
              priority
              className="h-12 w-auto"
            />
      
          </div>

          <nav className="mt-8">
            <div className="px-4 space-y-2">
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  router.pathname === '/admin/dashboard'
                    ? 'text-white shadow-md transform scale-105 hover:bg-amber-100 hover:text-amber-900'
                    : 'text-amber-800 hover:bg-amber-100 hover:text-amber-900'
                }`}
                style={{
                  backgroundColor: router.pathname === '/admin/dashboard' ? 'rgb(96 70 41)' : 'transparent'
                }}
              >
                <Package className="w-5 h-5 mr-3" />
                Dashboard
              </Link>

              <Link
                href="/admin/configuraciones"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  router.pathname === '/admin/configuraciones'
                    ? 'text-white shadow-md transform scale-105 hover:bg-amber-100 hover:text-amber-900'
                    : 'text-amber-800 hover:bg-amber-100 hover:text-amber-900'
                }`}
                style={{
                  backgroundColor: router.pathname === '/admin/configuraciones' ? 'rgb(96 70 41)' : 'transparent'
                }}
              >
                <Settings className="w-5 h-5 mr-3" />
                Configuraciones
              </Link>

              <Link
                href="/admin/whatsapp"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  router.pathname === '/admin/whatsapp'
                    ? 'text-white shadow-md transform scale-105 hover:bg-amber-100 hover:text-amber-900'
                    : 'text-amber-800 hover:bg-amber-100 hover:text-amber-900'
                }`}
                style={{
                  backgroundColor: router.pathname === '/admin/whatsapp' ? 'rgb(96 70 41)' : 'transparent'
                }}
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                Configuración WhatsApp
              </Link>

              <Link
                href="/"
                className="flex items-center px-4 py-3 text-sm font-medium text-amber-800 rounded-lg hover:bg-amber-100 hover:text-amber-900 transition-all duration-200"
              >
                <Home className="w-5 h-5 mr-3" />
                Ver Tienda
              </Link>
            </div>
          </nav>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-200 bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-900">
                  {auth.user?.nombre}
                </p>
                <p className="text-xs text-amber-700">
                  {auth.user?.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded-lg transition-all duration-200"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón flotante para mostrar sidebar cuando está oculto */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          style={{ background: 'rgb(96 70 41)' }}
          className="fixed left-4 top-4 z-40 w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <ChevronLeft className={`w-7 h-7 rotate-180 ${isRotating ? 'animate-spin-slow' : ''}`} color="#fff" />
        </button>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout(props: AdminLayoutProps) {
  return (
    <AdminLayoutInner {...props} />
  )
} 