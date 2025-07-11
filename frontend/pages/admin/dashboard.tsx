import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Plus, Edit, Trash2, Package, DollarSign, Users, ShoppingCart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { productosApi, gustosApi, categoriasApi } from '../../utils/api'
import { formatPrice, getGustoId } from '../../lib/helpers'
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
  imagenes?: string[]
  categoria: { _id: string; nombre: string }
  stock: number
  activo: boolean
  gustos?: { _id: string; nombre: string; descripcion?: string }[]
  stockPorGusto?: { gusto: { _id: string; nombre: string; descripcion?: string }; stock: number }[]
}

export default function AdminDashboard() {
  const { auth } = useAuth()
  const { sidebarOpen } = useSidebar()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null)
  const [showInactiveProducts, setShowInactiveProducts] = useState(false)
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false)
  const [productToPermanentDelete, setProductToPermanentDelete] = useState<Producto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    imagenes: [] as string[],
    categoria: '',
    stock: '',
    gustos: [] as string[],
    stockPorGusto: [] as { gusto: string; stock: number }[]
  })
  const [categorias, setCategorias] = useState<any[]>([])
  const [gustos, setGustos] = useState<any[]>([])
  const [errors, setErrors] = useState<any>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  useEffect(() => {
    loadProductos()
    categoriasApi.getAll().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setCategorias(res.data)
      } else {
        setCategorias([])
        console.error('Error al obtener categorías:', res)
      }
    })
    gustosApi.getAll().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setGustos(res.data)
      } else {
        setGustos([])
        console.error('Error al obtener gustos:', res)
      }
    })
  }, [auth.token])

  useEffect(() => {
    const newErrors: any = {}
    if (formData.nombre.length > 100) newErrors.nombre = 'Máximo 100 caracteres'
    if (formData.descripcion.length > 500) newErrors.descripcion = 'Máximo 500 caracteres'
    if (formData.precio && parseFloat(formData.precio) < 0) newErrors.precio = 'No puede ser negativo'
    if (formData.stock && parseInt(formData.stock) < 0) newErrors.stock = 'No puede ser negativo'
    setErrors((prev: any) => ({ ...prev, ...newErrors }))
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

  // Filtrar productos según el estado activo/inactivo y búsqueda
  const filteredProductos = productos.filter(producto => {
    // Filtro por estado activo/inactivo
    const matchesStatus = showInactiveProducts ? true : producto.activo;
    
    // Filtro por término de búsqueda
    const matchesSearch = searchTerm === '' || 
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (producto.categoria && producto.categoria.nombre && 
       producto.categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: any = {}
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio'
    if (formData.nombre.length > 100) newErrors.nombre = 'Máximo 100 caracteres'
    if (!formData.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria'
    if (formData.descripcion.length > 500) newErrors.descripcion = 'Máximo 500 caracteres'
    if (!formData.precio) newErrors.precio = 'El precio es obligatorio'
    else if (parseFloat(formData.precio) < 0) newErrors.precio = 'No puede ser negativo'
    if (!formData.imagen.trim() && formData.imagenes.length === 0) newErrors.imagen = 'Al menos una imagen es obligatoria'
    if (!formData.categoria) newErrors.categoria = 'La categoría es obligatoria'
    if (!formData.stock) newErrors.stock = 'El stock es obligatorio'
    else if (parseInt(formData.stock) < 0) newErrors.stock = 'No puede ser negativo'
    
    // Validar stock por gusto
    if (formData.gustos.length > 0) {
      const stockErrors = validateStockPorGusto()
      if (!stockErrors) {
        newErrors.stockPorGusto = 'Hay errores en el stock por gusto'
      }
    }
    
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
        gustos: formData.gustos,
        stockPorGusto: formData.stockPorGusto,
        imagenes: formData.imagenes.length > 0 ? formData.imagenes : [formData.imagen]
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
      imagenes: producto.imagenes || [producto.imagen],
      categoria: producto.categoria && producto.categoria._id ? producto.categoria._id : (categorias.length > 0 ? categorias[0]._id : ''),
      stock: producto.stock.toString(),
      gustos: producto.gustos?.map(g => g._id) || [],
      stockPorGusto: producto.stockPorGusto?.map(sg => ({ 
        gusto: getGustoId(sg.gusto), 
        stock: sg.stock 
      })) || []
    })
    setImagePreview(producto.imagen)
    setImageFile(null)
    setImageFiles([])
    setImagePreviews(producto.imagenes || [producto.imagen])
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen: '',
      imagenes: [],
      categoria: categorias.length > 0 ? categorias[0]._id : '',
      stock: '',
      gustos: [],
      stockPorGusto: []
    })
    setImagePreview("")
    setImageFile(null)
    setImageFiles([])
    setImagePreviews([])
    setErrors({})
  }

  const openNewProductModal = () => {
    setEditingProduct(null)
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen: '',
      imagenes: [],
      categoria: categorias.length > 0 ? categorias[0]._id : '',
      stock: '',
      gustos: [],
      stockPorGusto: []
    })
    setImagePreview("")
    setImageFile(null)
    setImageFiles([])
    setImagePreviews([])
    setErrors({})
    setShowModal(true)
  }

  const openDeleteModal = (producto: Producto) => {
    setProductToDelete(producto)
    setShowConfirmModal(true)
  }

  const openPermanentDeleteModal = (producto: Producto) => {
    setProductToPermanentDelete(producto)
    setShowPermanentDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete || !auth.token) return

    try {
      const response = await productosApi.delete(productToDelete._id, auth.token)
      if (response.success) {
        toast.success('Producto eliminado correctamente')
        loadProductos()
      } else {
        toast.error(`Error al eliminar producto: ${response.error}`)
      }
    } catch (error) {
      console.error('Error eliminando producto:', error)
      toast.error('Error al eliminar producto')
    } finally {
      setShowConfirmModal(false)
      setProductToDelete(null)
    }
  }

  const handleReactivate = async (producto: Producto) => {
    if (!auth.token) return

    try {
      const response = await productosApi.update(producto._id, { activo: true }, auth.token)
      if (response.success) {
        toast.success('Producto reactivado correctamente')
        loadProductos()
      } else {
        toast.error(`Error al reactivar producto: ${response.error}`)
      }
    } catch (error) {
      console.error('Error reactivando producto:', error)
      toast.error('Error al reactivar producto')
    }
  }

  const handlePermanentDelete = async (producto: Producto) => {
    if (!auth.token) return

    try {
      const response = await productosApi.permanentDelete(producto._id, auth.token)
      if (response.success) {
        toast.success('Producto eliminado definitivamente')
        loadProductos()
      } else {
        toast.error(`Error al eliminar producto: ${response.error}`)
      }
    } catch (error) {
      console.error('Error eliminando producto:', error)
      toast.error('Error al eliminar producto')
    }
  }

  const confirmPermanentDelete = async () => {
    if (!productToPermanentDelete || !auth.token) return

    try {
      const response = await productosApi.permanentDelete(productToPermanentDelete._id, auth.token)
      if (response.success) {
        toast.success('Producto eliminado definitivamente de la base de datos')
        loadProductos()
      } else {
        toast.error(`Error al eliminar producto: ${response.error}`)
      }
    } catch (error) {
      console.error('Error eliminando producto definitivamente:', error)
      toast.error('Error al eliminar producto')
    } finally {
      setShowPermanentDeleteModal(false)
      setProductToPermanentDelete(null)
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
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    // Validar cada archivo
    for (const file of files) {
      if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
        toast.error("Solo se permite PNG o JPG")
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Cada archivo debe pesar menos de 2MB")
        return
      }
    }
    
    if (files.length > 10) {
      toast.error("Máximo 10 imágenes por producto")
      return
    }

    const newImageFiles = [...imageFiles, ...files]
    setImageFiles(newImageFiles)
    
    // Convertir archivos a base64
    const newPreviews: string[] = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === files.length) {
          setImagePreviews([...imagePreviews, ...newPreviews])
          setFormData({ 
            ...formData, 
            imagenes: [...formData.imagenes, ...newPreviews],
            imagen: formData.imagen || newPreviews[0] // Primera imagen como principal
          })
        }
      }
      reader.readAsDataURL(file)
    })
  }



  // Borrar imagen específica del array
  const handleRemoveImage = (index: number) => {
    const newImagenes = formData.imagenes.filter((_, i) => i !== index)
    const newImageFiles = imageFiles.filter((_, i) => i !== index)
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index)
    
    setFormData({ 
      ...formData, 
      imagenes: newImagenes,
      imagen: newImagenes.length > 0 ? newImagenes[0] : "" // Primera imagen como principal
    })
    setImageFiles(newImageFiles)
    setImagePreviews(newImagePreviews)
  }

  // Función para manejar cambios en gustos y actualizar stock por gusto
  const handleGustosChange = (gustosSeleccionados: string[]) => {
    setFormData({ ...formData, gustos: gustosSeleccionados })
    
    // Actualizar stock por gusto
    const nuevoStockPorGusto = gustosSeleccionados.map(gustoId => {
      const stockExistente = formData.stockPorGusto.find(sg => sg.gusto === gustoId)
      return {
        gusto: gustoId,
        stock: stockExistente ? stockExistente.stock : 0
      }
    })
    
    setFormData(prev => ({ ...prev, stockPorGusto: nuevoStockPorGusto }))
  }

  // Función para actualizar stock de un gusto específico
  const handleStockGustoChange = (gustoId: string, value: string) => {
    // Validar que solo sean números enteros positivos
    const numericValue = value.replace(/[^0-9]/g, '')
    const stock = numericValue === '' ? 0 : parseInt(numericValue)
    
    setFormData(prev => ({
      ...prev,
      stockPorGusto: prev.stockPorGusto.map(sg => 
        sg.gusto === gustoId ? { ...sg, stock } : sg
      )
    }))

    // Limpiar error específico de este gusto
    setErrors((prev: any) => {
      const newErrors = { ...prev }
      delete newErrors[`stockGusto_${gustoId}`]
      return newErrors
    })
  }

  // Función para validar stock por gusto
  const validateStockPorGusto = () => {
    if (formData.gustos.length === 0) return true
    
    const newErrors: any = {}
    let hasError = false
    
    formData.stockPorGusto.forEach((sg) => {
      if (sg.stock < 0) {
        newErrors[`stockGusto_${sg.gusto}`] = 'No puede ser negativo'
        hasError = true
      }
      if (sg.stock > 999999) {
        newErrors[`stockGusto_${sg.gusto}`] = 'No puede ser mayor a 999,999'
        hasError = true
      }
      if (sg.stock === 0) {
        newErrors[`stockGusto_${sg.gusto}`] = 'El stock es obligatorio'
        hasError = true
      }
    })
    
    setErrors((prev: any) => ({ ...prev, ...newErrors }))
    return !hasError
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
                  {new Set(productos.map(p => p.categoria && p.categoria.nombre ? p.categoria.nombre : 'Sin categoría')).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  📦 Productos
                </h2>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showInactiveProducts}
                        onChange={(e) => setShowInactiveProducts(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded-md transition-all duration-300 flex items-center justify-center transform ${
                        showInactiveProducts
                          ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-200 scale-110'
                          : 'bg-white border-gray-300 group-hover:border-amber-400 group-hover:bg-amber-50 group-hover:scale-105'
                      }`}>
                        {showInactiveProducts && (
                          <svg className="w-3 h-3 text-white transition-all duration-200 ease-in-out" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="font-medium group-hover:text-amber-700 transition-colors duration-200">
                      Mostrar inactivos
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
                      {filteredProductos.length} productos
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-green-700 font-medium">{productos.filter(p => p.activo).length} activos</span>
                      </div>
                      {productos.filter(p => !p.activo).length > 0 && (
                        <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          <span className="text-red-700 font-medium">{productos.filter(p => !p.activo).length} inactivos</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={openNewProductModal}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Nuevo Producto</span>
              </button>
            </div>
            
            {/* Barra de búsqueda */}
            <div className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos por nombre, descripción o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500 bg-white"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
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
            ) : filteredProductos.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay productos {showInactiveProducts ? 'inactivos' : 'activos'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {showInactiveProducts 
                    ? 'Todos los productos están activos' 
                    : 'No hay productos activos para mostrar'
                  }
                </p>
                {!showInactiveProducts && (
                  <button
                    onClick={() => setShowInactiveProducts(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Ver productos inactivos
                  </button>
                )}
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
                      Stock por Gusto
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
                  {filteredProductos.map((producto) => (
                    <tr key={producto._id} className={`hover:bg-gray-50 transition-colors duration-200 ${
                      !producto.activo ? 'bg-gray-50 opacity-75' : ''
                    }`}>
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
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {producto.nombre}
                              </div>
                              {!producto.activo && (
                                <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  Inactivo
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {producto.descripcion}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                          {producto.categoria && producto.categoria.nombre ? producto.categoria.nombre : 'Sin categoría'}
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
                        {producto.stockPorGusto && producto.stockPorGusto.length > 0 ? (
                          <div className="space-y-1">
                            {producto.stockPorGusto.map(sg => {
                              const gustoId = getGustoId(sg.gusto);
                              const gusto = gustos.find(g => g._id === gustoId);
                              return (
                                <div key={gustoId} className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-700">
                                    {gusto?.nombre || 'Desconocido'}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    sg.stock > 0 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {sg.stock} unid.
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin stock por gusto</span>
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
                        {!producto.activo && (
                          <div className="text-xs text-gray-500 mt-1">
                            Eliminado
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(producto)}
                            className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 p-1 rounded transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {producto.activo ? (
                            <button
                              onClick={() => openDeleteModal(producto)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded transition-colors duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleReactivate(producto)}
                                className="text-green-600 hover:text-green-800 hover:bg-green-100 p-1 rounded transition-colors duration-200"
                                title="Reactivar producto"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openPermanentDeleteModal(producto)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded transition-colors duration-200"
                                title="Eliminar definitivamente"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
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
                    Imágenes del producto (PNG/JPG, máx 2MB cada una, máximo 10 imágenes) *
                  </label>
                  
                  {/* Input para múltiples archivos */}
                  <div className="mb-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      multiple
                      onChange={handleImageFileChange}
                      className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Selecciona múltiples archivos o arrastra varios archivos aquí.</p>
                  </div>

                  {/* Input para URL individual (compatibilidad) */}
                  <div className="mb-3">
                    <input
                      type="url"
                      placeholder="https://... (URL de imagen individual)"
                      value={formData.imagen}
                      onChange={e => setFormData({ ...formData, imagen: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-amber-500 focus:ring-amber-500 bg-white border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">O pega una URL de imagen individual.</p>
                  </div>

                  {/* Preview de imágenes */}
                  {(formData.imagenes.length > 0 || formData.imagen) && (
                    <div className="mt-4">
                      <span className="block text-sm font-medium text-gray-700 mb-2">Imágenes del producto:</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Mostrar imágenes del array */}
                        {formData.imagenes.map((img, index) => (
                          <div key={`array-${index}`} className="relative group">
                            <OptimizedImage
                              src={img}
                              alt={`Imagen ${index + 1}`}
                              width={128}
                              height={128}
                              className="w-full h-24 object-cover border rounded-lg bg-gray-50 shadow"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                        
                        {/* Mostrar imagen individual si no está en el array */}
                        {formData.imagen && !formData.imagenes.includes(formData.imagen) && (
                          <div className="relative group">
                            <OptimizedImage
                              src={formData.imagen}
                              alt="Imagen individual"
                              width={128}
                              height={128}
                              className="w-full h-24 object-cover border rounded-lg bg-gray-50 shadow"
                            />
                            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                              URL
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        💡 La primera imagen será la imagen principal del producto. Puedes subir hasta 10 imágenes.
                      </div>
                    </div>
                  )}

                  {errors.imagen && <div className="mt-1 text-sm text-red-600">⚠️ {errors.imagen}</div>}
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
                    {categorias.length === 0 && (
                      <option value="">Sin categoría disponible</option>
                    )}
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
                      handleGustosChange(options);
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
                    onChange={(e) => {
                      setFormData({...formData, stock: e.target.value})
                      // Limpiar error cuando el usuario empiece a escribir
                      if (errors.stock) {
                        setErrors((prev: any) => ({ ...prev, stock: undefined }))
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white ${errors.stock ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'}`}
                    min={0}
                  />
                  {errors.stock && <div className="mt-1 text-sm text-red-600">⚠️ {errors.stock}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock por Gusto {formData.gustos.length > 0 && <span className="text-red-500">*</span>}
                  </label>
                  {formData.gustos.length > 0 ? (
                    <div className="space-y-4">
                      {formData.gustos.map(gustoId => {
                        const gusto = gustos.find(g => g._id === gustoId);
                        const stockPorGusto = formData.stockPorGusto.find(sg => sg.gusto === gustoId);
                        const stockValue = stockPorGusto?.stock || 0;
                        const errorKey = `stockGusto_${gustoId}`;
                        const hasError = errors[errorKey];
                        
                        return (
                          <div key={gustoId} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Stock para {gusto?.nombre || 'Desconocido'} *
                            </label>
                            <input
                              type="number"
                              required
                              value={stockValue === 0 ? '' : stockValue.toString()}
                              onChange={(e) => {
                                handleStockGustoChange(gustoId, e.target.value)
                                // Limpiar error cuando el usuario empiece a escribir
                                if (hasError) {
                                  setErrors((prev: any) => ({ ...prev, [errorKey]: undefined }))
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 bg-white ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-amber-500 focus:ring-amber-500'}`}
                              min={0}
                              placeholder="0"
                            />
                            {hasError && <div className="mt-1 text-sm text-red-600">⚠️ {hasError}</div>}
                          </div>
                        );
                      })}
                      <div className="text-xs text-gray-500 mt-2">
                        💡 Define el stock disponible para cada gusto. Solo números enteros positivos.
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-700">
                        📝 Selecciona gustos arriba para definir el stock individual de cada uno
                      </p>
                    </div>
                  )}
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

      {/* Permanent Delete Confirmation Modal */}
      {showPermanentDeleteModal && (
        <ConfirmModal
          isOpen={showPermanentDeleteModal}
          onClose={() => setShowPermanentDeleteModal(false)}
          onConfirm={confirmPermanentDelete}
          title="Eliminación Definitiva"
          message={`¿Estás completamente seguro de que quieres eliminar definitivamente el producto "${productToPermanentDelete?.nombre}"? 

⚠️ Esta acción eliminará el producto de la base de datos de forma permanente y no se puede deshacer.`}
          confirmText="Eliminar Definitivamente"
          cancelText="Cancelar"
          type="danger"
        />
      )}
    </AdminLayout>
  )
}