import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import toast from 'react-hot-toast'
import { configApi, gustosApi, categoriasApi } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smoq-proyect-production.up.railway.app'

export default function Configuraciones() {
  const { auth } = useAuth()
  const [minFreeShipping, setMinFreeShipping] = useState(25000)
  const [loading, setLoading] = useState(false)
  const [categorias, setCategorias] = useState<any[]>([])
  const [catNombre, setCatNombre] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catEdit, setCatEdit] = useState<any>(null)
  const [catLoading, setCatLoading] = useState(false)
  const [gustos, setGustos] = useState<any[]>([])
  const [gustoNombre, setGustoNombre] = useState('')
  const [gustoDesc, setGustoDesc] = useState('')
  const [gustoEdit, setGustoEdit] = useState<any>(null)
  const [gustoLoading, setGustoLoading] = useState(false)
  
  // Estados para el modal de confirmación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string, type: 'categoria' | 'gusto'} | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  // Cargar categorías
  useEffect(() => {
    categoriasApi.getAll().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setCategorias(res.data)
      } else {
        setCategorias([])
        console.error('Error al obtener categorías:', res)
        toast.error('No se pudieron cargar las categorías')
      }
    })
  }, [])

  // Cargar gustos
  useEffect(() => {
    gustosApi.getAll().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setGustos(res.data)
      } else {
        setGustos([])
        console.error('Error al obtener gustos:', res)
        toast.error('No se pudieron cargar los gustos')
      }
    })
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validaciones completas
    const errors = []
    
    // Validar monto mínimo de envío gratis
    if (!minFreeShipping || minFreeShipping <= 0) {
      errors.push('El monto mínimo para envío gratis debe ser mayor a 0')
    } else if (minFreeShipping < 1000) {
      errors.push('El monto mínimo para envío gratis debe ser al menos $1,000')
    } else if (minFreeShipping > 1000000) {
      errors.push('El monto mínimo para envío gratis no puede ser mayor a $1,000,000')
    }
    
    // Si hay errores, mostrar el primero y no guardar
    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }
    
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

  // Funciones locales para create, update y delete de categorías y gustos
  const createCategoria = async (nombre: string, descripcion: string) => {
    const res = await fetch(`${API_URL}/api/config/categorias`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({ nombre, descripcion })
    })
    return res.json()
  }
  const updateCategoria = async (id: string, nombre: string, descripcion: string) => {
    const res = await fetch(`${API_URL}/api/config/categorias/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({ nombre, descripcion })
    })
    return res.json()
  }
  const deleteCategoria = async (id: string) => {
    const res = await fetch(`${API_URL}/api/config/categorias/${id}`, { 
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
    return res.json()
  }
  const createGusto = async (nombre: string, descripcion: string) => {
    const res = await fetch(`${API_URL}/api/config/gustos`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({ nombre, descripcion })
    })
    return res.json()
  }
  const updateGusto = async (id: string, nombre: string, descripcion: string) => {
    const res = await fetch(`${API_URL}/api/config/gustos/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({ nombre, descripcion })
    })
    return res.json()
  }
  const deleteGusto = async (id: string) => {
    const res = await fetch(`${API_URL}/api/config/gustos/${id}`, { 
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    })
    return res.json()
  }

  const handleCatSave = async (e: any) => {
    e.preventDefault()
    
    if (!auth.token) {
      toast.error('No tienes permisos para realizar esta acción')
      return
    }
    
    setCatLoading(true)
    try {
      let res
      if (catEdit) {
        res = await updateCategoria(catEdit._id, catNombre, catDesc)
      } else {
        res = await createCategoria(catNombre, catDesc)
      }
      if (res && !res.error) {
        toast.success(catEdit ? 'Categoría actualizada' : 'Categoría creada')
        setCatNombre('')
        setCatDesc('')
        setCatEdit(null)
        const reload = await categoriasApi.getAll();
        setCategorias(reload.success && Array.isArray(reload.data) ? reload.data : [])
      } else {
        toast.error(res.error || res.message || 'Error')
      }
    } finally {
      setCatLoading(false)
    }
  }

  const handleCatEdit = (cat: any) => {
    setCatEdit(cat)
    setCatNombre(cat.nombre)
    setCatDesc(cat.descripcion || '')
  }

  const handleCatDelete = async (id: string, name: string) => {
    setItemToDelete({ id, name, type: 'categoria' })
    setShowDeleteModal(true)
  }

  const handleGustoSave = async (e: any) => {
    e.preventDefault()
    
    if (!auth.token) {
      toast.error('No tienes permisos para realizar esta acción')
      return
    }
    
    setGustoLoading(true)
    try {
      let res
      if (gustoEdit) {
        res = await updateGusto(gustoEdit._id, gustoNombre, gustoDesc)
      } else {
        res = await createGusto(gustoNombre, gustoDesc)
      }
      if (res && !res.error) {
        toast.success(gustoEdit ? 'Gusto actualizado' : 'Gusto creado')
        setGustoNombre('')
        setGustoDesc('')
        setGustoEdit(null)
        const reload = await gustosApi.getAll();
        setGustos(reload.success && Array.isArray(reload.data) ? reload.data : [])
      } else {
        toast.error(res.error || res.message || 'Error')
      }
    } finally {
      setGustoLoading(false)
    }
  }

  const handleGustoEdit = (g: any) => {
    setGustoEdit(g)
    setGustoNombre(g.nombre)
    setGustoDesc(g.descripcion || '')
  }

  const handleGustoDelete = async (id: string, name: string) => {
    setItemToDelete({ id, name, type: 'gusto' })
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete || !auth.token) {
      setShowDeleteModal(false)
      setItemToDelete(null)
      return
    }

    setDeleteLoading(true)
    try {
      let res
      if (itemToDelete.type === 'categoria') {
        res = await deleteCategoria(itemToDelete.id)
        if (res && !res.error) {
          toast.success('Categoría eliminada')
          const reload = await categoriasApi.getAll();
          setCategorias(reload.success && Array.isArray(reload.data) ? reload.data : [])
        } else {
          toast.error(res.error || res.message || 'Error')
        }
      } else {
        res = await deleteGusto(itemToDelete.id)
        if (res && !res.error) {
          toast.success('Gusto eliminado')
          const reload = await gustosApi.getAll();
          setGustos(reload.success && Array.isArray(reload.data) ? reload.data : [])
        } else {
          toast.error(res.error || res.message || 'Error')
        }
      }
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
  }

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-xl shadow mb-10">
        <h1 className="text-2xl font-bold mb-6">Configuraciones de la Tienda</h1>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto mínimo para envío gratis
            </label>
            <div className="relative">
              <input
                type="number"
                min={1000}
                max={1000000}
                value={minFreeShipping}
                onChange={e => setMinFreeShipping(Number(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 bg-white ${
                  minFreeShipping && (minFreeShipping <= 0 || minFreeShipping < 1000 || minFreeShipping > 1000000)
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-amber-500'
                }`}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Monto mínimo que debe alcanzar el carrito para que el envío sea gratuito.
            </p>
            {minFreeShipping && (minFreeShipping <= 0 || minFreeShipping < 1000 || minFreeShipping > 1000000) && (
              <div className="mt-1 text-sm text-red-600">
                ⚠️ El monto debe estar entre $1,000 y $1,000,000
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
      </div>
      {/* Gestión de categorías */}
      <div className="max-w-xl mx-auto mb-10 bg-white p-8 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Categorías de productos</h2>
        <form onSubmit={handleCatSave} className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Nombre"
              value={catNombre}
              onChange={e => setCatNombre(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500 bg-white border-gray-300"
              required
              maxLength={50}
            />
            <span className="absolute right-3 top-2 text-xs text-gray-400">{catNombre.length}/50</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Nombre de la categoría. Máximo 50 caracteres.</p>
          <div className="relative">
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={catDesc}
              onChange={e => setCatDesc(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500 bg-white border-gray-300"
              maxLength={200}
            />
            <span className="absolute right-3 top-2 text-xs text-gray-400">{catDesc.length}/200</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Descripción opcional. Máximo 200 caracteres.</p>
          <div className="flex gap-2">
            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled={catLoading}>{catEdit ? 'Actualizar' : 'Agregar'}</button>
            {catEdit && <button type="button" className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold text-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => { setCatEdit(null); setCatNombre(''); setCatDesc(''); }}>Cancelar</button>}
          </div>
        </form>
        <ul className="divide-y">
          {categorias.map(cat => (
            <li key={cat._id} className="py-2 flex justify-between items-center">
              <div>
                <span className="font-semibold">{cat.nombre}</span>
                {cat.descripcion && <span className="ml-2 text-gray-500 text-sm">{cat.descripcion}</span>}
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:underline" onClick={() => handleCatEdit(cat)}>Editar</button>
                <button className="text-red-600 hover:underline" onClick={() => handleCatDelete(cat._id, cat.nombre)}>Eliminar</button>
              </div>
            </li>
          ))}
          {categorias.length === 0 && <li className="text-gray-500">No hay categorías</li>}
        </ul>
      </div>
      {/* Gestión de gustos */}
      <div className="max-w-xl mx-auto mb-10 bg-white p-8 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Gustos (sabores/opciones)</h2>
        <form onSubmit={handleGustoSave} className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Nombre"
              value={gustoNombre}
              onChange={e => setGustoNombre(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500 bg-white border-gray-300"
              required
              maxLength={50}
            />
            <span className="absolute right-3 top-2 text-xs text-gray-400">{gustoNombre.length}/50</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Nombre del gusto. Máximo 50 caracteres.</p>
          <div className="relative">
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={gustoDesc}
              onChange={e => setGustoDesc(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500 bg-white border-gray-300"
              maxLength={200}
            />
            <span className="absolute right-3 top-2 text-xs text-gray-400">{gustoDesc.length}/200</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Descripción opcional. Máximo 200 caracteres.</p>
          <div className="flex gap-2">
            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled={gustoLoading}>{gustoEdit ? 'Actualizar' : 'Agregar'}</button>
            {gustoEdit && <button type="button" className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold text-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => { setGustoEdit(null); setGustoNombre(''); setGustoDesc(''); }}>Cancelar</button>}
          </div>
        </form>
        <ul className="divide-y">
          {gustos.map(g => (
            <li key={g._id} className="py-2 flex justify-between items-center">
              <div>
                <span className="font-semibold">{g.nombre}</span>
                {g.descripcion && <span className="ml-2 text-gray-500 text-sm">{g.descripcion}</span>}
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:underline" onClick={() => handleGustoEdit(g)}>Editar</button>
                <button className="text-red-600 hover:underline" onClick={() => handleGustoDelete(g._id, g.nombre)}>Eliminar</button>
              </div>
            </li>
          ))}
          {gustos.length === 0 && <li className="text-gray-500">No hay gustos</li>}
        </ul>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar eliminación
                  </h3>
                  <p className="text-sm text-gray-500">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que quieres eliminar 
                <span className="font-semibold text-gray-900"> &ldquo;{itemToDelete?.name}&rdquo;</span>?
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {itemToDelete?.type === 'categoria' 
                  ? 'Esta categoría será eliminada permanentemente. Los productos asociados mantendrán la categoría pero no se podrá editar.'
                  : 'Este gusto será eliminado permanentemente. Los productos asociados mantendrán el gusto pero no se podrá editar.'
                }
              </p>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deleteLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
} 