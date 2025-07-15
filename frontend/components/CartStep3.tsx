import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, Mail, MessageCircle, User, Phone, CreditCard, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/helpers'
import { pedidosApi, configApi } from '../utils/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/router'

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
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        clearCart()
        toast.success('¡Pedido enviado correctamente!')
        
        // Redirigir inmediatamente a la página de confirmación
        router.push('/confirmacion-pedido')
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
    
    // Abrir WhatsApp en nueva ventana y redirigir inmediatamente
    window.open(urlWhatsApp, '_blank')
    
    // Limpiar carrito y redirigir inmediatamente
    clearCart()
    toast.success('¡Pedido enviado por WhatsApp!')
    
    // Redirigir inmediatamente sin delay
    router.push('/confirmacion-pedido')
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

        {/* Métodos de envío */}
        <div className="space-y-6">
          <div className="flex items-center mb-6">
            <div className="rounded-full w-6 h-6 flex items-center justify-center mr-3" style={{ backgroundColor: 'rgb(124, 79, 0)' }}>
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Método de Envío
            </h3>
          </div>

          {/* Email */}
          <div className="rounded-xl p-6 border-2 border-gray-200 hover:border-amber-300 transition-colors duration-200 cursor-pointer" onClick={() => handleEnviarPedido('email')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-full w-12 h-12 flex items-center justify-center mr-4" style={{ backgroundColor: 'rgb(124, 79, 0)' }}>
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Enviar por Email</h4>
                  <p className="text-gray-600 text-sm">Recibirás confirmación por email</p>
                </div>
              </div>
              <div className="text-right">
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="rounded-xl p-6 border-2 border-gray-200 hover:border-green-300 transition-colors duration-200 cursor-pointer" onClick={handleEnviarWhatsApp}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-full w-12 h-12 flex items-center justify-center mr-4 bg-green-500">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Enviar por WhatsApp</h4>
                  <p className="text-gray-600 text-sm">Abrirá WhatsApp con tu pedido</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Botón volver */}
          <div className="pt-4">
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 