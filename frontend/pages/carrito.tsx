import { useState } from 'react'
import Head from 'next/head'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import CartStep1 from '../components/CartStep1'
import CartStep2 from '../components/CartStep2'
import CartStep3 from '../components/CartStep3'
import Link from 'next/link'
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton'

export default function Carrito() {
  const { state } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: ''
  })

  // Si no hay productos en el carrito, mostrar mensaje
  if (state.items.length === 0) {
    return (
      <>
        <Head>
          <title>Carrito - SMOQ Tienda</title>
        </Head>
        <div className="min-h-screen" style={{ backgroundColor: 'rgb(253 253 249)' }}>
          <Navbar />
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Tu carrito está vacío
              </h1>
              <p className="text-gray-600 mb-8">
                Agrega algunos productos para continuar con tu compra.
              </p>
              <Link href="/" className="inline-block bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                Ver productos
              </Link>
            </div>
          </div>
          <FloatingWhatsAppButton />
        </div>
      </>
    )
  }

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleFormSubmit = (data: typeof formData) => {
    setFormData(data)
    handleNextStep()
  }

  return (
    <>
      <Head>
        <title>Carrito - SMOQ Tienda</title>
      </Head>
      
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(224 217 190)' }}>
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full"
                    style={{ background: 'rgb(0, 0, 0)', color: 'white' }}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <svg
                      width="80" height="8" viewBox="0 0 80 8" fill="none"
                      className="mx-2"
                      style={{ display: 'block' }}
                    >
                      <defs>
                        <linearGradient id={`line-gradient-${step}`} x1="0" y1="4" x2="80" y2="4" gradientUnits="userSpaceOnUse">
                          <stop stopColor="rgb(0, 0, 0)" />
                          <stop offset="1" stopColor="rgb(0, 0, 0)" />
                        </linearGradient>
                      </defs>
                      <polygon points="0,2 76,2 80,4 76,6 0,6" fill={`url(#line-gradient-${step})`} />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-4 text-sm" style={{ color: 'rgb(0, 0, 0)' }}>
              <span className="font-medium">Productos</span>
              <span>Contacto</span>
              <span>Confirmación</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            {currentStep === 1 && (
              <CartStep1 
                onNext={handleNextStep}
              />
            )}
            
            {currentStep === 2 && (
              <CartStep2 
                onNext={handleFormSubmit}
                onBack={handlePrevStep}
                initialData={formData}
              />
            )}
            
            {currentStep === 3 && (
              <CartStep3 
                onBack={handlePrevStep}
                formData={formData}
              />
            )}
          </div>
          <FloatingWhatsAppButton />
        </div>
      </div>
    </>
  )
} 