import { useState } from 'react'
import { ArrowLeft, User, Mail, Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
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
    <div className="max-w-4xl mx-auto">
      {/* Header elegante */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgb(255, 249, 225), rgb(255, 241, 184))' }}>
            <User className="w-7 h-7" style={{ color: 'rgb(124, 79, 0)' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Información de Contacto</h2>
            <p className="text-gray-600 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Necesitamos tus datos para coordinar la entrega
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Nombre completo */}
          <div>
            <label htmlFor="nombreCompleto" className="block text-sm font-semibold text-gray-900 mb-2">
              Nombre completo *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white ${
                  errors.nombreCompleto 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200'
                }`}
                style={{
                  '--tw-ring-color': errors.nombreCompleto ? undefined : 'rgb(124, 79, 0)',
                  '--tw-border-opacity': errors.nombreCompleto ? undefined : '1',
                  'border-color': errors.nombreCompleto ? undefined : 'rgb(124, 79, 0)',
                  'background-color': 'white',
                  'WebkitAutofill': 'none',
                  'WebkitBoxShadow': '0 0 0 1000px white inset'
                } as React.CSSProperties}
                onFocus={(e) => {
                  if (!errors.nombreCompleto) {
                    e.target.style.borderColor = 'rgb(124, 79, 0)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.nombreCompleto) {
                    e.target.style.borderColor = 'rgb(229, 231, 235)';
                    e.target.style.backgroundColor = 'white';
                  }
                }}
                placeholder="Tu nombre completo"
              />
            </div>
            {errors.nombreCompleto && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.nombreCompleto}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white ${
                  errors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200'
                }`}
                style={{
                  '--tw-ring-color': errors.email ? undefined : 'rgb(124, 79, 0)',
                  '--tw-border-opacity': errors.email ? undefined : '1',
                  'background-color': 'white',
                  'WebkitAutofill': 'none',
                  'WebkitBoxShadow': '0 0 0 1000px white inset'
                } as React.CSSProperties}
                onFocus={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = 'rgb(124, 79, 0)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    e.target.style.borderColor = 'rgb(229, 231, 235)';
                    e.target.style.backgroundColor = 'white';
                  }
                }}
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-semibold text-gray-900 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white ${
                  errors.telefono 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-200'
                }`}
                style={{
                  '--tw-ring-color': errors.telefono ? undefined : 'rgb(124, 79, 0)',
                  '--tw-border-opacity': errors.telefono ? undefined : '1',
                  'background-color': 'white',
                  'WebkitAutofill': 'none',
                  'WebkitBoxShadow': '0 0 0 1000px white inset'
                } as React.CSSProperties}
                onFocus={(e) => {
                  if (!errors.telefono) {
                    e.target.style.borderColor = 'rgb(124, 79, 0)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.telefono) {
                    e.target.style.borderColor = 'rgb(229, 231, 235)';
                    e.target.style.backgroundColor = 'white';
                  }
                }}
                placeholder="11 1234-5678"
              />
            </div>
            {errors.telefono && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.telefono}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Formato: 11 1234-5678 o +54 9 11 1234-5678
            </p>
          </div>

          {/* Información adicional */}
          <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgb(255, 249, 225), rgb(255, 241, 184))', border: 'none' }}>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-white">
                <CheckCircle className="w-4 h-4" style={{ color: 'rgb(124, 79, 0)' }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'rgb(124, 79, 0)' }}>
                  <strong>Importante:</strong> Debes proporcionar al menos un email o teléfono válido para que podamos contactarte y coordinar la entrega de tu pedido.
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
            <button
              type="button"
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-black text-white rounded-xl font-bold transition-all duration-300 hover:bg-gray-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
            >
              <span>{isSubmitting ? 'Procesando...' : 'Continuar'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 