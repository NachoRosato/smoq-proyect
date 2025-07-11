import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, Mail, MessageCircle, User, Phone, CreditCard, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/helpers'
import { pedidosApi, configApi } from '../utils/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface FormData {
  nombreCompleto: string
  email: string
  telefono: string
}

interface CartStep3Props {
  onBack: () => void
  formData: FormData
}

export default function CartStep3({ onBack, formData }: CartStep3Props) {
  const { state, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pedidoEnviado, setPedidoEnviado] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappTitle, setWhatsappTitle] = useState('')
  const [whatsappDescription, setWhatsappDescription] = useState('')
  const [whatsappGoodbye, setWhatsappGoodbye] = useState('')

  useEffect(() => {
    // Obtener configuración de WhatsApp
    configApi.getWhatsApp().then(res => {
      if (res.success && res.config) {
        setWhatsappNumber(res.config.whatsappNumber || '')
        setWhatsappTitle(res.config.whatsappTitle || '')
        setWhatsappDescription(res.config.whatsappDescription || '')
        setWhatsappGoodbye(res.config.whatsappGoodbye || '')
      }
    }).catch(error => {
      console.warn('Error obteniendo configuración de WhatsApp:', error)
    })
  }, [])

  const handleEnviarPedido = async (metodoContacto: 'email' | 'whatsapp') => {
    setIsSubmitting(true)

    try {
      // Preparar productos para el pedido
      const productos = state.items.map(item => ({
        _id: item.producto._id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad,
        gustoId: item.gustoId,
        gustoNombre: item.gustoId && Array.isArray(item.producto.gustos)
          ? (item.producto.gustos.find((g: any) => g._id === item.gustoId)?.nombre || 'Sin especificar')
          : undefined
      }))

      const pedidoData = {
        nombre: formData.nombreCompleto,
        email: formData.email || undefined,
        telefono: formData.telefono || undefined,
        productos,
        metodoContacto
      }

      const response = await pedidosApi.create(pedidoData)

      if (response.success) {
        setPedidoEnviado(true)
        clearCart()
        toast.success('¡Pedido enviado correctamente!')
      } else {
        toast.error(response.error || 'Error al enviar el pedido')
      }
    } catch (error) {
      console.error('Error enviando pedido:', error)
      toast.error('Error al enviar el pedido')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEnviarWhatsApp = () => {
    
    if (!whatsappNumber) {
      toast.error('No hay número de WhatsApp configurado')
      return
    }

    // Crear mensaje de WhatsApp
    const productosText = state.items.map(item => {
      const gustoNombre = item.gustoId && Array.isArray(item.producto.gustos)
        ? (item.producto.gustos.find((g: any) => g._id === item.gustoId)?.nombre || 'Sin especificar')
        : undefined
      return `• ${item.producto.nombre}${gustoNombre ? ` (Sabor: ${gustoNombre})` : ''} - ${item.cantidad} x ${formatPrice(item.producto.precio)}`
    }).join('\n')

    const mensaje = `${whatsappTitle || 'Nuevo Pedido - SMOQ'}

${whatsappDescription || 'Somos SMOQ y acabas de tomar la mejor decisión de tu vida. Gracias por elegirnos!'}

Cliente: ${formData.nombreCompleto}
Email: ${formData.email || 'No proporcionado'}
Teléfono: ${formData.telefono || 'No proporcionado'}

Productos:
${productosText}

Total: ${formatPrice(state.total)}

---
${whatsappGoodbye || 'Enviado desde la tienda online'}`

    // Codificar el mensaje para WhatsApp
    const mensajeCodificado = encodeURIComponent(mensaje)
    const numeroLimpio = whatsappNumber.replace(/\D/g, '')
    const urlWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`
    
    // Abrir WhatsApp en nueva ventana
    window.open(urlWhatsApp, '_blank')
  }

  if (pedidoEnviado) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-amber-100 max-w-md mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Pedido Enviado Exitosamente!
        </h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Tu pedido ha sido recibido y nos pondremos en contacto contigo pronto 
          para coordinar la entrega.
        </p>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-800 text-sm leading-relaxed">
            <strong>Próximos pasos:</strong> Te contactaremos por 
            {formData.email ? ' email' : ''}
            {formData.email && formData.telefono ? ' o ' : ''}
            {formData.telefono ? ' teléfono' : ''} 
            para coordinar la entrega de tu pedido.
          </p>
        </div>
        <Link 
          href="/" 
          className="inline-block bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Volver a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-center mb-6 relative">
        <div className="flex items-center">
          <div className="rounded-full w-8 h-8 flex items-center justify-center mr-3" style={{ backgroundColor: 'rgb(124, 79, 0)' }}>
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Confirmar Pedido
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resumen del pedido */}
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <div className="rounded-full w-6 h-6 flex items-center justify-center mr-3" style={{ backgroundColor: 'rgb(124, 79, 0)' }}>
              <Package className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Resumen del Pedido
            </h3>
          </div>
          
          {/* Información de contacto */}
          <div className="rounded-xl p-5" style={{ background: 'linear-gradient(135deg, rgb(255, 249, 225), rgb(255, 241, 184))' }}>
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 mr-2" style={{ color: 'rgb(124, 79, 0)' }} />
              <h4 className="font-semibold text-gray-900">Información de contacto</h4>
            </div>
            <div className="space-y-2">
              <p className="text-gray-900 font-medium">{formData.nombreCompleto}</p>
              {formData.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-gray-700">{formData.email}</p>
                </div>
              )}
              {formData.telefono && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-gray-700">{formData.telefono}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lista de productos */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-lg">Productos</h4>
            <div className="space-y-2">
              {state.items.map((item) => (
                <div key={item.producto._id + (item.gustoId || '')} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">{item.producto.nombre}</p>
                      {item.gustoId && (
                        <p className="text-sm font-medium mb-1" style={{ color: 'rgb(124, 79, 0)' }}>
                          Sabor: {Array.isArray(item.producto.gustos) ? item.producto.gustos.find((g: any) => g._id === item.gustoId)?.nombre || 'Sin especificar' : 'Sin especificar'}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.cantidad} x {formatPrice(item.producto.precio)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg" style={{ color: 'rgb(124, 79, 0)' }}>
                        {formatPrice(item.producto.precio * item.cantidad)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-black rounded-xl p-5 text-white">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total del Pedido</span>
              <span className="text-2xl font-bold text-white">
                {formatPrice(state.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Opciones de envío */}
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <div className="rounded-full w-6 h-6 flex items-center justify-center mr-3" style={{ backgroundColor: 'rgb(124, 79, 0)' }}>
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Método de Contacto
            </h3>
          </div>
          
          <div className="space-y-3">
            {/* Email */}
            <button
              onClick={() => handleEnviarPedido('email')}
              disabled={isSubmitting}
              className="w-full rounded-xl p-5 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, rgb(255, 249, 225), rgb(255, 241, 184))' }}
            >
              <div className="flex items-center space-x-4">
                <div className="rounded-full w-12 h-12 flex items-center justify-center" style={{ backgroundColor: 'rgb(124, 79, 0)' }}>
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Enviar por Email</h4>
                  <p className="text-gray-600">
                    Recibirás una confirmación por email con todos los detalles
                  </p>
                </div>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleEnviarWhatsApp}
              disabled={isSubmitting || !whatsappNumber}
              className="w-full bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-300 rounded-xl p-5 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full w-12 h-12 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Enviar por WhatsApp</h4>
                  <p className="text-gray-600">
                    {whatsappNumber ? 'Se abrirá WhatsApp con tu pedido listo para enviar' : 'WhatsApp no configurado'}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {isSubmitting && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 mr-3" style={{ borderColor: 'rgb(124, 79, 0)' }}></div>
                <p className="text-gray-800 font-medium">
                  Procesando tu pedido...
                </p>
              </div>
            </div>
          )}

          {/* Botón Volver - Dentro del grid */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
              style={{ 
                color: 'rgb(124, 79, 0)',
                background: 'rgb(255, 241, 184)'
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 