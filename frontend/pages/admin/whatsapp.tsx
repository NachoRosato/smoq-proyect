import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'
import { configApi } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppConfig() {
  const { auth } = useAuth()
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappTitle, setWhatsappTitle] = useState('')
  const [whatsappDescription, setWhatsappDescription] = useState('')
  const [whatsappGoodbye, setWhatsappGoodbye] = useState('')
  const [loading, setLoading] = useState(false)

  // Función para formatear y validar el número de WhatsApp
  const formatWhatsAppNumber = (value: string) => {
    // Remover todos los caracteres no numéricos excepto el +
    let cleaned = value.replace(/[^\d+]/g, '')
    
    // Asegurar que empiece con +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }
    
    // Limitar a 15 dígitos (incluyendo el +)
    if (cleaned.length > 15) {
      cleaned = cleaned.substring(0, 15)
    }
    
    return cleaned
  }

  const handleWhatsAppNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsAppNumber(e.target.value)
    setWhatsappNumber(formatted)
  }

  // Función para validar si el número es válido
  const isValidWhatsAppNumber = (number: string) => {
    // Debe tener al menos 10 dígitos (código de país + número)
    const digitsOnly = number.replace(/\D/g, '')
    return digitsOnly.length >= 10 && number.startsWith('+')
  }

  useEffect(() => {
    configApi.get().then(res => {
      if (res.success && res.config) {
        setWhatsappNumber(res.config.whatsappNumber || '')
        setWhatsappTitle(res.config.whatsappTitle || '')
        setWhatsappDescription(res.config.whatsappDescription || '')
        setWhatsappGoodbye(res.config.whatsappGoodbye || '')
      } else {
        console.warn('No se pudo obtener configuración de WhatsApp')
        setWhatsappNumber('')
        setWhatsappTitle('')
        setWhatsappDescription('')
        setWhatsappGoodbye('')
      }
    }).catch(error => {
      console.warn('Error obteniendo configuración de WhatsApp:', error)
      setWhatsappNumber('')
      setWhatsappTitle('')
      setWhatsappDescription('')
      setWhatsappGoodbye('')
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones completas
    const errors = []
    
    // Validar número de WhatsApp
    if (!whatsappNumber) {
      errors.push('El número de WhatsApp es obligatorio')
    } else if (!isValidWhatsAppNumber(whatsappNumber)) {
      errors.push('El número de WhatsApp no es válido. Debe incluir código de país (+XX) y al menos 10 dígitos.')
    }
    
    // Validar título
    if (!whatsappTitle.trim()) {
      errors.push('El título del mensaje es obligatorio')
    } else if (whatsappTitle.length < 3) {
      errors.push('El título debe tener al menos 3 caracteres')
    }
    
    // Validar descripción
    if (!whatsappDescription.trim()) {
      errors.push('La descripción promocional es obligatoria')
    } else if (whatsappDescription.length < 10) {
      errors.push('La descripción debe tener al menos 10 caracteres')
    }
    
    // Validar despedida
    if (!whatsappGoodbye.trim()) {
      errors.push('El mensaje de despedida es obligatorio')
    } else if (whatsappGoodbye.length < 3) {
      errors.push('El mensaje de despedida debe tener al menos 3 caracteres')
    }
    
    // Si hay errores, mostrar el primero y no guardar
    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }
    
    setLoading(true)
    try {
      const res = await configApi.updateWhatsAppMessage({
        whatsappNumber,
        whatsappTitle,
        whatsappDescription,
        whatsappGoodbye
      }, auth.token || '')
      if (res.success) {
        toast.success('Configuración de WhatsApp guardada')
      } else {
        toast.error('Error al guardar configuración de WhatsApp')
      }
    } catch {
      toast.error('Error al guardar configuración de WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg mb-10">
        {/* Título y teléfono */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenido a la configuración de WhatsApp
          </h1>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <MessageCircle className="w-6 h-6" />
            <span className="text-lg">📱</span>
          </div>
        </div>

        {/* Línea divisoria moderna */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-amber-300 shadow-sm"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-amber-600 font-medium">
              Configuración
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Número de WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp
            </label>
            <div className="relative">
              <input
                type="tel"
                value={whatsappNumber}
                onChange={handleWhatsAppNumberChange}
                placeholder="Ej: +54 9 11 1234-5678"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 bg-white ${
                  whatsappNumber && !isValidWhatsAppNumber(whatsappNumber)
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amber-500'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {whatsappNumber && !isValidWhatsAppNumber(whatsappNumber) ? (
                  <span className="text-red-400">⚠️</span>
                ) : whatsappNumber && isValidWhatsAppNumber(whatsappNumber) ? (
                  <span className="text-green-400">✅</span>
                ) : (
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Este número será utilizado para enviar los mensajes de pedidos desde el carrito.
            </p>
            
            {/* Indicador de validación */}
            {whatsappNumber && (
              <div className={`mt-2 text-sm ${
                isValidWhatsAppNumber(whatsappNumber) 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {isValidWhatsAppNumber(whatsappNumber) 
                  ? '✅ Número válido' 
                  : '⚠️ Número inválido - Debe incluir código de país (+XX) y al menos 10 dígitos'
                }
              </div>
            )}
            
            {/* Ayudas para completar el número */}
            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="text-sm font-medium text-amber-800 mb-2">💡 Ayudas para completar:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600">📱</span>
                  <span className="text-amber-700">Argentina: +54 9 11 1234-5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600">📱</span>
                  <span className="text-amber-700">México: +52 1 55 1234-5678</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600">📱</span>
                  <span className="text-amber-700">España: +34 6 12 34 56 78</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-600">📱</span>
                  <span className="text-amber-700">Chile: +56 9 1234-5678</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-amber-600">
                <strong>Consejo:</strong> Incluye siempre el código de país (+XX) y elimina espacios, guiones o paréntesis.
              </div>
            </div>
          </div>

          {/* Título del mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del mensaje
            </label>
            <div className="relative">
              <input
                type="text"
                value={whatsappTitle}
                onChange={e => setWhatsappTitle(e.target.value)}
                placeholder="Ej: Nuevo Pedido - SMOQ"
                maxLength={50}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 bg-white ${
                  whatsappTitle && whatsappTitle.length < 3
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amber-500'
                }`}
              />
              <div className="absolute top-3 right-3 text-xs text-gray-400">
                {whatsappTitle.length}/50
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Este será el título principal del mensaje de WhatsApp. Máximo 50 caracteres.
            </p>
            {whatsappTitle && whatsappTitle.length < 3 && (
              <div className="mt-1 text-sm text-red-600">
                ⚠️ El título debe tener al menos 3 caracteres
              </div>
            )}
          </div>

          {/* Descripción del mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción promocional
            </label>
            <div className="relative">
              <textarea
                value={whatsappDescription}
                onChange={e => setWhatsappDescription(e.target.value)}
                placeholder="Ej: Somos SMOQ y acabas de tomar la mejor decisión de tu vida. Gracias por elegirnos!"
                rows={3}
                maxLength={200}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 bg-white resize-none ${
                  whatsappDescription && whatsappDescription.length < 10
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amber-500'
                }`}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {whatsappDescription.length}/200
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Mensaje promocional que aparecerá después del título. Ideal para destacar tu marca. Máximo 200 caracteres.
            </p>
            {whatsappDescription && whatsappDescription.length < 10 && (
              <div className="mt-1 text-sm text-red-600">
                ⚠️ La descripción debe tener al menos 10 caracteres
              </div>
            )}
          </div>

          {/* Despedida del mensaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje de despedida
            </label>
            <div className="relative">
              <input
                type="text"
                value={whatsappGoodbye}
                onChange={e => setWhatsappGoodbye(e.target.value)}
                placeholder="Ej: Enviado desde la tienda online"
                maxLength={50}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 bg-white ${
                  whatsappGoodbye && whatsappGoodbye.length < 3
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amber-500'
                }`}
              />
              <div className="absolute top-3 right-3 text-xs text-gray-400">
                {whatsappGoodbye.length}/50
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Mensaje corto que aparecerá al final. Máximo 50 caracteres.
            </p>
            {whatsappGoodbye && whatsappGoodbye.length < 3 && (
              <div className="mt-1 text-sm text-red-600">
                ⚠️ El mensaje de despedida debe tener al menos 3 caracteres
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </form>

        {/* Vista previa del mensaje */}
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Vista previa del mensaje:
          </h3>
          <div className="bg-white p-4 rounded border text-sm">
            <p className="font-bold text-gray-900 mb-2">{whatsappTitle || 'Nuevo Pedido - SMOQ'}</p>
            <p className="text-gray-700 mb-2">{whatsappDescription || 'Somos SMOQ y acabas de tomar la mejor decisión de tu vida. Gracias por elegirnos!'}</p>
            <p className="text-gray-600 text-xs mt-4">{whatsappGoodbye || 'Enviado desde la tienda online'}</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">
            ¿Cómo funciona?
          </h3>
          <ul className="text-sm text-amber-700 space-y-2">
            <li>• Configura aquí el número donde recibirás los pedidos por WhatsApp</li>
            <li>• Personaliza el mensaje para que refleje tu marca y estilo</li>
            <li>• Los clientes podrán enviar sus pedidos directamente desde el carrito</li>
            <li>• El mensaje incluirá automáticamente los detalles del pedido</li>
            <li>• Asegúrate de incluir el código de país en el número (ej: +54 para Argentina)</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
} 