import { useState, useEffect } from 'react'
import { configApi } from '../utils/api'

export default function TestWhatsApp() {
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappTitle, setWhatsappTitle] = useState('')
  const [whatsappDescription, setWhatsappDescription] = useState('')
  const [whatsappGoodbye, setWhatsappGoodbye] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    configApi.getWhatsApp().then(res => {
      console.log('Respuesta de configuración WhatsApp:', res);
      if (res.success && res.config) {
        console.log('Configuración de WhatsApp:', res.config);
        setWhatsappNumber(res.config.whatsappNumber || '')
        setWhatsappTitle(res.config.whatsappTitle || '')
        setWhatsappDescription(res.config.whatsappDescription || '')
        setWhatsappGoodbye(res.config.whatsappGoodbye || '')
      } else {
        console.log('No hay configuración de WhatsApp');
      }
      setLoading(false)
    }).catch(error => {
      console.warn('Error obteniendo configuración de WhatsApp:', error)
      setLoading(false)
    })
  }, [])

  const handleTestWhatsApp = () => {
    if (!whatsappNumber) {
      alert('No hay número de WhatsApp configurado')
      return
    }

    const mensaje = `${whatsappTitle || 'Prueba de WhatsApp - SMOQ'}

${whatsappDescription || 'Este es un mensaje de prueba para verificar que la funcionalidad de WhatsApp funciona correctamente.'}

Número configurado: ${whatsappNumber}
Fecha: ${new Date().toLocaleString()}

---
${whatsappGoodbye || 'Enviado desde la página de prueba'}`

    const mensajeCodificado = encodeURIComponent(mensaje)
    const numeroLimpio = whatsappNumber.replace(/\D/g, '')
    const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`
    
    console.log('URL de WhatsApp generada:', urlWhatsApp);
    window.open(urlWhatsApp, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🧪 Prueba de WhatsApp
        </h1>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Configuración actual:</h3>
            <p className="text-sm text-gray-600">
              {whatsappNumber ? (
                <span className="text-green-600 font-medium">✅ {whatsappNumber}</span>
              ) : (
                <span className="text-red-600 font-medium">❌ No configurado</span>
              )}
            </p>
          </div>

          {/* Vista previa del mensaje */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-medium text-amber-800 mb-2">Vista previa del mensaje:</h3>
            <div className="bg-white p-3 rounded border text-xs">
              <p className="font-bold text-gray-900 mb-1">{whatsappTitle || 'Prueba de WhatsApp - SMOQ'}</p>
              <p className="text-gray-700 mb-1">{whatsappDescription || 'Este es un mensaje de prueba...'}</p>
              <p className="text-gray-600 text-xs mt-2">{whatsappGoodbye || 'Enviado desde la página de prueba'}</p>
            </div>
          </div>

          <button
            onClick={handleTestWhatsApp}
            disabled={!whatsappNumber}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {whatsappNumber ? '📱 Probar WhatsApp' : '❌ WhatsApp no configurado'}
          </button>

          {!whatsappNumber && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Para probar esta funcionalidad, primero debes configurar un número de WhatsApp en el panel de administración.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Volver a la tienda
          </a>
        </div>
      </div>
    </div>
  )
} 