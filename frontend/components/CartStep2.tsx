import { useState } from 'react'
import { ArrowLeft, User, Mail, Phone } from 'lucide-react'
import { isValidEmail, isValidPhone, hasValidContact, cleanString } from '../lib/helpers'

interface FormData {
  nombreCompleto: string
  email: string
  telefono: string
}

interface CartStep2Props {
  onNext: (data: FormData) => void
  onBack: () => void
  initialData: FormData
}

interface FormErrors {
  nombreCompleto?: string
  email?: string
  telefono?: string
  general?: string
}

export default function CartStep2({ onNext, onBack, initialData }: CartStep2Props) {
  const [formData, setFormData] = useState<FormData>(initialData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validar nombre completo
    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es requerido'
    } else if (formData.nombreCompleto.trim().length < 2) {
      newErrors.nombreCompleto = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validar email si está presente
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    // Validar teléfono si está presente
    if (formData.telefono && !isValidPhone(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido (ej: 11 1234-5678)'
    }

    // Validar que al menos email o teléfono esté presente
    if (!hasValidContact(formData.email, formData.telefono)) {
      newErrors.general = 'Debe proporcionar al menos un email o teléfono válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }

    // Limpiar error general si se está corrigiendo
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Limpiar datos antes de enviar
      const cleanedData = {
        nombreCompleto: cleanString(formData.nombreCompleto),
        email: formData.email.trim(),
        telefono: formData.telefono.trim()
      }

      onNext(cleanedData)
    } catch (error) {
      console.error('Error en formulario:', error)
      setErrors({ general: 'Error al procesar el formulario' })
    } finally {
      setIsSubmitting(false)
    }
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
          📝 Información de Contacto
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error general */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Nombre completo */}
        <div>
          <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              id="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.nombreCompleto ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tu nombre completo"
            />
          </div>
          {errors.nombreCompleto && (
            <p className="mt-1 text-sm text-red-600">{errors.nombreCompleto}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="tu@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleInputChange('telefono', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="11 1234-5678"
            />
          </div>
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Formato: 11 1234-5678 o +54 9 11 1234-5678
          </p>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Nota:</strong> Debes proporcionar al menos un email o teléfono válido 
            para que podamos contactarte y coordinar la entrega de tu pedido.
          </p>
        </div>

        {/* Botones */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 btn-secondary py-3"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Procesando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  )
} 