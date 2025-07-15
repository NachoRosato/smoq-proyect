import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { CheckCircle, ArrowRight, Package, Heart } from 'lucide-react'
import Navbar from '../components/Navbar'
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton'

export default function ConfirmacionPedido() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(15)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsRedirecting(true)
          setTimeout(() => {
            router.push('/')
          }, 500)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <>
      <Head>
        <title>Pedido Confirmado - SMOQ Tienda</title>
      </Head>
      
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(224 217 190)' }}>
        <Navbar />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Card principal */}
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-amber-100">
              
              {/* Icono de éxito con animación */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              {/* Título principal */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                ¡Pedido realizado con éxito!
              </h1>
              
              {/* Subtítulo */}
              <p className="text-xl text-gray-600 mb-8">
                Gracias por elegirnos
              </p>

              {/* Mensaje de agradecimiento */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6 text-red-500 mr-2" />
                  <span className="text-green-800 font-semibold text-lg">
                    ¡Gracias por tu confianza!
                  </span>
                </div>
                <p className="text-green-700 leading-relaxed">
                  Tu pedido ha sido recibido y nos pondremos en contacto contigo pronto 
                  para coordinar la entrega. ¡Esperamos que disfrutes nuestros productos!
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center mb-3">
                  <Package className="w-6 h-6 text-amber-600 mr-2" />
                  <span className="text-amber-800 font-semibold">
                    Próximos pasos
                  </span>
                </div>
                <p className="text-amber-700 text-sm leading-relaxed">
                  Te contactaremos por email o whatsapp para coordinar la entrega de tu pedido. 
                  ¡Mantente atento a tu bandeja de entrada!
                </p>
              </div>

              {/* Countdown y redirección */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mr-3"></div>
                  <span className="text-gray-600 font-medium">
                    {isRedirecting ? 'Redirigiendo...' : `Redirigiendo en ${countdown} segundos...`}
                  </span>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((15 - countdown) / 15) * 100}%` }}
                  ></div>
                </div>

                {/* Botón manual */}
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Ir ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Mensaje adicional */}
            <div className="text-center mt-8">
              <p className="text-gray-600 text-sm">
                ¿Tienes alguna pregunta? No dudes en contactarnos
              </p>
            </div>
          </div>
        </div>
        
        <FloatingWhatsAppButton />
      </div>
    </>
  )
} 