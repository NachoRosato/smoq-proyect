import { useState } from 'react'
import { ArrowLeft, CheckCircle, Mail, MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/helpers'
import { pedidosApi } from '../utils/api'
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

  const handleEnviarPedido = async (metodoContacto: 'email' | 'whatsapp') => {
    setIsSubmitting(true)

    try {
      // Preparar productos para el pedido
      const productos = state.items.map(item => ({
        _id: item.producto._id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        cantidad: item.cantidad
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

  if (pedidoEnviado) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Pedido Enviado Exitosamente!
        </h2>
        <p className="text-gray-600 mb-6">
          Tu pedido ha sido recibido y nos pondremos en contacto contigo pronto 
          para coordinar la entrega.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 text-sm">
            <strong>Próximos pasos:</strong> Te contactaremos por 
            {formData.email ? ' email' : ''}
            {formData.email && formData.telefono ? ' o ' : ''}
            {formData.telefono ? ' teléfono' : ''} 
            para coordinar la entrega de tu pedido.
          </p>
        </div>
        <Link href="/" className="btn-primary">
          Volver a la tienda
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          ✅ Confirmar Pedido
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Resumen del pedido */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Resumen del Pedido
          </h3>
          
          {/* Información de contacto */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Información de contacto:</h4>
            <p className="text-gray-700">{formData.nombreCompleto}</p>
            {formData.email && (
              <p className="text-gray-700">{formData.email}</p>
            )}
            {formData.telefono && (
              <p className="text-gray-700">{formData.telefono}</p>
            )}
          </div>

          {/* Lista de productos */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Productos:</h4>
            {state.items.map((item) => (
              <div key={item.producto._id} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.producto.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {item.cantidad} x {formatPrice(item.producto.precio)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatPrice(item.producto.precio * item.cantidad)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(state.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Opciones de envío */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📧 Método de Contacto
          </h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Nota:</strong> Tu pedido será enviado por email al administrador. 
                Te contactaremos para coordinar la entrega.
              </p>
            </div>

            {/* Botón enviar por email */}
            <button
              onClick={() => handleEnviarPedido('email')}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="w-5 h-5" />
              <span>
                {isSubmitting ? 'Enviando pedido...' : 'Enviar pedido por Email'}
              </span>
            </button>

            {/* Botón enviar por WhatsApp (opcional) */}
            {formData.telefono && (
              <button
                onClick={() => handleEnviarPedido('whatsapp')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-5 h-5" />
                <span>
                  {isSubmitting ? 'Enviando pedido...' : 'Enviar pedido por WhatsApp'}
                </span>
              </button>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">¿Qué pasa después?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Recibirás una confirmación por email</li>
              <li>• Nos pondremos en contacto para coordinar la entrega</li>
              <li>• Podrás pagar al momento de recibir tu pedido</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 