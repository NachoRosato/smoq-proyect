import { useState } from 'react'
import Head from 'next/head'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import CartStep1 from '../components/CartStep1'
import CartStep2 from '../components/CartStep2'
import CartStep3 from '../components/CartStep3'
import Link from 'next/link'

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
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Tu carrito está vacío
              </h1>
              <p className="text-gray-600 mb-8">
                Agrega algunos productos para continuar con tu compra.
              </p>
              <Link href="/" className="btn-primary inline-block">
                Ver productos
              </Link>
            </div>
          </div>
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
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-primary-600 border-primary-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-4 ${
                      currentStep > step ? 'bg-primary-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : ''}>
                Productos
              </span>
              <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : ''}>
                Contacto
              </span>
              <span className={currentStep >= 3 ? 'text-primary-600 font-medium' : ''}>
                Confirmación
              </span>
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
        </div>
      </div>
    </>
  )
} 