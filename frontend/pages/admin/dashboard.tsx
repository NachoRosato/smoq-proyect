import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Plus, Edit, Trash2, Package, DollarSign, Users, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { productosApi } from '../../utils/api'
import { formatPrice } from '../../lib/helpers'
import AdminLayout from '../../components/AdminLayout'
import ConfirmModal from '../../components/ConfirmModal'
import toast from 'react-hot-toast'
import OptimizedImage from '../../components/OptimizedImage'
import { useSidebar } from '../../context/SidebarContext'

interface Producto {
  _id: string
  nombre: string
  precio: number
  descripcion: string
  imagen: string
  categoria: { _id: string; nombre: string }
  stock: number
  activo: boolean
  gustos?: { _id: string; nombre: string; descripcion?: string }[]
}

const categoriasApi = {
  get: async (token: string) => fetch('/api/config/categorias', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
};

const gustosApi = {
  get: async (token: string) => fetch('/api/config/gustos', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
};

export default function AdminDashboard() {
  const { auth } = useAuth()
  const { sidebarOpen } = useSidebar()
  console.log('sidebarOpen en AdminDashboard:', sidebarOpen)
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    categoria: '',
    stock: '',
    gustos: [] as string[]
  })
  const [categorias, setCategorias] = useState<any[]>([])
  const [gustos, setGustos] = useState<any[]>([])
  const [errors, setErrors] = useState<any>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    loadProductos()
    if (auth.token) {
      categoriasApi.get(auth.token).then(setCategorias)
      gustosApi.get(auth.token).then(setGustos)
    }
  }, [auth.token])

  useEffect(() => {
    const newErrors: any = {}
    if (formData.nombre.length > 100) newErrors.nombre = 'Máximo 100 caracteres'
    if (formData.descripcion.length > 500) newErrors.descripcion = 'Máximo 500 caracteres'
    if (formData.precio && parseFloat(formData.precio) < 0) newErrors.precio = 'No puede ser negativo'
    if (formData.stock && parseInt(formData.stock) < 0) newErrors.stock = 'No puede ser negativo'
    setErrors(newErrors)
  }, [formData])

  const loadProductos = async () => {
    try {
      setLoading(true)
      const response = await productosApi.getAll() as { success: boolean, data?: Producto[] }
      
      if (response.success && response.data) {
        setProductos(response.data || [])
      } else {
        toast.error('Error al cargar productos')
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: any = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    if (formData.nombre.length > 100) newErrors.nombre = 'Máximo 100 caracteres'
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria'
    if (formData.descripcion.length > 500) newErrors.descripcion = 'Máximo 500 caracteres'
    if (!formData.precio) newErrors.precio = 'El precio es obligatorio'
    else if (parseFloat(formData.precio) < 0) newErrors.precio = 'No puede ser negativo'
    if (!formData.imagen.trim()) newErrors.imagen = 'La URL de imagen es obligatoria'
    if (!formData.categoria) newErrors.categoria = 'La categoría es obligatoria'
    if (!formData.stock) newErrors.stock = 'El stock es obligatorio'
    else if (parseInt(formData.stock) < 0) newErrors.stock = 'No puede ser negativo'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    
    if (!auth.token) {
      toast.error('No tienes permisos')
      return
    }

    try {
      const productData = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        gustos: formData.gustos
      }

      if (editingProduct) {
        const response = await productosApi.update(editingProduct._id, productData, auth.token)
        if (response.success) {
          toast.success('Producto actualizado correctamente')
        } else {
          toast.error(`Error al actualizar producto: ${response.error}`)
        }
      } else {
        const response = await productosApi.create(productData, auth.token)
        if (response.success) {
          toast.success('Producto creado correctamente')
        } else {
          toast.error(`Error al crear producto: ${response.error}`)
        }
      }

      setShowModal(false)
      setEditingProduct(null)
      resetForm()
      loadProductos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar producto')
    }
  }

  const handleEdit = (producto: Producto) => {
    setEditingProduct(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      imagen: producto.imagen,
      categoria: producto.categoria._id,
      stock: producto.stock.toString(),
      gustos: producto.gustos?.map(g => g._id) || []
    })
    setImagePreview(producto.imagen)
    setImageFile(null)
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen: '',
      categoria: categorias.length > 0 ? categorias[0]._id : '',
      stock: '',
      gustos: []
    })
    setImagePreview("")
    setImageFile(null)
  }

  const openNewProductModal = () => {
    setEditingProduct(null)
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen: '',
      categoria: categorias.length > 0 ? categorias[0]._id : '',
      stock: '',
      gustos: []
    })
    setImagePreview("")
    setImageFile(null)
    setShowModal(true)
  }

  const openDeleteModal = (producto: Producto) => {
    setProductToDelete(producto)
    setShowConfirmModal(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete || !auth.token) {
      return
    }

    try {
      const response = await productosApi.delete(productToDelete._id, auth.token)
      if (response.success) {
        toast.success('Producto eliminado correctamente')
        loadProductos()
      } else {
        toast.error('Error al eliminar producto')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar producto')
    }
  }

  // Agregar función auxiliar para obtener el nombre de la categoría
  function getCategoriaNombre(categoria: any, categorias: any[]): string {
    if (typeof categoria === 'object' && categoria !== null && 'nombre' in categoria) {
      return categoria.nombre
    }
    const found = categorias.find(c => c._id === categoria)
    return found ? found.nombre : 'Sin categoría'
  }

  // Manejo de cambio de archivo
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
      toast.error("Solo se permite PNG o JPG")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("El archivo debe pesar menos de 2MB")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, imagen: reader.result as string })
      setImagePreview(reader.result as string)
      setImageFile(file)
    }
    reader.readAsDataURL(file)
  }

  // Borrar archivo y habilitar input URL
  const handleRemoveImageFile = () => {
    setImageFile(null)
    setImagePreview("")
    setFormData({ ...formData, imagen: "" })
  }

  return (
    <AdminLayout>
      <Head>
        <title>Dashboard - SMOQ Tienda</title>
      </Head>

      <div className="p-6">
        {/* Header */}
        <div className={`mb-8 transition-all duration-300 ${!sidebarOpen ? 'pl-16' : ''}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-amber-700">
            Gestiona tus productos y pedidos desde aquí
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-amber-200 transition-all duration-300 cursor-pointer">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900">{productos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-amber-200 transition-all duration-300 cursor-pointer">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {productos.filter(p => p.activo).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-amber-200 transition-all duration-300 cursor-pointer">
            <div className="flex items-center">
              <ShoppingCart className="w-8 h-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {productos.reduce((acc, p) => acc + p.stock, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-amber-200 transition-all duration-300 cursor-pointer">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-amber-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(productos.map(p => p.categoria.nombre)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                📦 Productos
              </h2>
              <button
                onClick={openNewProductModal}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando productos...</p>
              </div>
            ) : productos.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay productos
                </h3>
                <p className="text-gray-600 mb-4">
                  Comienza agregando tu primer producto
                </p>
                <button
                  onClick={openNewProductModal}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Agregar Producto
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gustos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productos.map((producto) => (
                    <tr key={producto._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <OptimizedImage
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="w-full h-full object-cover"
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {producto.nombre}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {producto.descripcion}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                          {getCategoriaNombre(producto.categoria, categorias)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.gustos && producto.gustos.length > 0 ? (
                          <div className="text-xs text-gray-600">
                            {producto.gustos.map(g => g.nombre).join(', ')}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin gustos</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(producto.precio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {producto.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          producto.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(producto)}
                            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-1 rounded transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(producto)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear/editar producto */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border max-w-2xl w-full shadow-xl rounded-xl bg-white">
            <div className="mt-3">
              <h3 className="text-xl font-semibold text-amber-900 mb-6">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white ${errors.nombre ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'}`}
                      maxLength={100}
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-400">{formData.nombre.length}/100</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Nombre del producto. Máximo 100 caracteres.</p>
                  {errors.nombre && <div className="mt-1 text-sm text-red-600">⚠️ {errors.nombre}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white resize-none ${errors.descripcion ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'}`}
                      maxLength={500}
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-400">{formData.descripcion.length}/500</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Descripción detallada del producto. Máximo 500 caracteres.</p>
                  {errors.descripcion && <div className="mt-1 text-sm text-red-600">⚠️ {errors.descripcion}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.precio}
                      onChange={(e) => setFormData({...formData, precio: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white ${errors.precio ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'}`}
                      min={0}
                    />
                  </div>
                  {errors.precio && <div className="mt-1 text-sm text-red-600">⚠️ {errors.precio}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del producto (PNG/JPG, máx 2MB) o URL *
                  </label>
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageFileChange}
                      className="block w-full md:w-auto text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={handleRemoveImageFile}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Quitar archivo
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={!imageFile ? formData.imagen : ""}
                    onChange={e => setFormData({ ...formData, imagen: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500 bg-white border-gray-300 mt-2"
                    disabled={!!imageFile}
                    required={!imageFile}
                  />
                  <p className="text-xs text-gray-500 mt-1">Sube un PNG/JPG o pega una URL. Si subes archivo, se usará ese.</p>
                  {formData.imagen && (
                    <div className="mt-2">
                      <span className="block text-xs text-gray-500 mb-1">Preview:</span>
                      <OptimizedImage
                        src={imageFile ? imagePreview : formData.imagen}
                        alt="Preview"
                        width={128}
                        height={128}
                        className="w-32 h-32 object-contain border rounded-lg bg-gray-50 shadow"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500 bg-white border-gray-300"
                  >
                    {categorias.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gustos (opcional)
                  </label>
                  <select
                    multiple
                    value={formData.gustos || []}
                    onChange={e => {
                      const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                      setFormData({ ...formData, gustos: options });
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500 bg-white border-gray-300"
                  >
                    {gustos.map(g => (
                      <option key={g._id} value={g._id}>{g.nombre}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Mantén presionada Ctrl (Windows) o Cmd (Mac) para seleccionar varios.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white ${errors.stock ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'}`}
                    min={0}
                  />
                  {errors.stock && <div className="mt-1 text-sm text-red-600">⚠️ {errors.stock}</div>}
                </div>

                <div className="flex justify-between space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold text-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que quieres eliminar el producto "${productToDelete?.nombre}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      )}
    </AdminLayout>
  )
}