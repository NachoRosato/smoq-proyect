import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'
import { configApi } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

export default function Configuraciones() {
  const { auth } = useAuth()
  const [minFreeShipping, setMinFreeShipping] = useState(25000)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    configApi.get().then(res => {
      if (res.success && res.config) {
        setMinFreeShipping(res.config.minFreeShipping)
      } else {
        console.warn('No se pudo obtener configuración, usando valor por defecto')
        setMinFreeShipping(25000)
      }
    }).catch(error => {
      console.warn('Error obteniendo configuración:', error)
      setMinFreeShipping(25000)
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await configApi.update(minFreeShipping, auth.token || '')
      if (res.success) {
        toast.success('Configuración guardada')
      } else {
        toast.error('Error al guardar configuración')
      }
    } catch {
      toast.error('Error al guardar configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">Configuraciones de la Tienda</h1>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto mínimo para envío gratis
            </label>
            <input
              type="number"
              min={0}
              value={minFreeShipping}
              onChange={e => setMinFreeShipping(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
} 