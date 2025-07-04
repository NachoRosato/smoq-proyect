import { useState, useEffect } from 'react'
import Head from 'next/head'
import { ShoppingCart, Search, Filter, Sparkles, Star, TrendingUp, Zap } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { productosApi } from '../utils/api'
import ProductCard from '../components/ProductCard'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Listbox } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline'

interface Producto {
  _id: string
  nombre: string
  precio: number
  descripcion: string
  imagen: string
  categoria: string
  stock: number
}

interface ProductosApiResponse {
  productos: Producto[]
}

export default function Home() {
  const { addItem, state } = useCart()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  })

  const categorias = [
    { id: 'ropa', name: 'Ropa', icon: '👕' },
    { id: 'accesorios', name: 'Accesorios', icon: '💍' },
    { id: 'calzado', name: 'Calzado', icon: '👟' },
    { id: 'otros', name: 'Otros', icon: '📦' }
  ]

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      setLoading(true)
      const response = await productosApi.getAll() as { success: boolean, data?: ProductosApiResponse }
      if (response.success && response.data) {
        setProductos(response.data.productos || [])
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

  const handleAddToCart = (producto: Producto) => {
    addItem(producto)
    toast.success(`${producto.nombre} agregado al carrito`)
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Aquí puedes agregar la lógica para enviar el formulario
    // Por ahora solo mostraremos un mensaje de éxito
    toast.success('¡Gracias por contactarnos! Te responderemos pronto.')
    setShowContactModal(false)
    setContactForm({
      nombre: '',
      email: '',
      telefono: '',
      mensaje: ''
    })
  }

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || producto.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  const cartItemCount = state.items.reduce((total, item) => total + item.cantidad, 0)

  return (
    <>
      <Head>
        <title>SMOQ Tienda - Productos Únicos</title>
        <meta name="description" content="Descubre nuestra colección de productos únicos. Envío rápido y atención personalizada." />
        <meta name="keywords" content="tienda, productos, ropa, accesorios, calzado" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 mr-3 animate-pulse" />
                <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-primary-200 bg-clip-text text-transparent">
                  SMOQ
                </h1>
                <Sparkles className="w-8 h-8 ml-3 animate-pulse" />
              </div>
              <p className="text-xl lg:text-2xl text-primary-100 mb-8 leading-relaxed">
                Descubre productos únicos que cuentan historias. 
                <br />
                <span className="font-semibold">Calidad, estilo y atención personalizada.</span>
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 transition-all duration-300 hover:border-opacity-40 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <TrendingUp className="w-8 h-8 mx-auto mb-3 text-primary-200" />
                  <div className="text-2xl font-bold">+10.000</div>
                  <div className="text-primary-200">Productos Vendidos</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 transition-all duration-300 hover:border-opacity-40 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <Star className="w-8 h-8 mx-auto mb-3 text-primary-200" />
                  <div className="text-2xl font-bold">4.9/5</div>
                  <div className="text-primary-200">Satisfacción</div>
                </div>
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 transition-all duration-300 hover:border-opacity-40 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <Zap className="w-8 h-8 mx-auto mb-3 text-primary-200" />
                  <div className="text-2xl font-bold">24hs</div>
                  <div className="text-primary-200">Envío Rápido</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 rotate-180">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
            </svg>
          </div>
        </section>

        <main className="container mx-auto px-4 py-12">
          {/* Search and Filters Section */}
          <section className="mb-12">
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search + Category Filter unificados */}
                <div className="w-full flex items-center bg-white rounded-lg shadow-sm border-2 border-gray-200 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-500 transition-all">
                  {/* Input de búsqueda */}
                  <div className="flex-1 relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                      isSearchFocused ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      placeholder="¿Qué estás buscando?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="w-full pl-10 pr-3 py-2 bg-transparent border-none focus:ring-0 focus:outline-none text-base rounded-l-lg"
                    />
                  </div>
                  {/* Divider visual sutil */}
                  <div className="h-8 w-px bg-gray-200 mx-2" />
                  {/* Select de categorías con ícono de filtro dentro */}
                  <div className="relative w-44 flex-shrink-0">
                    <Listbox value={selectedCategory} onChange={setSelectedCategory}>
                      <Listbox.Button className="relative w-full cursor-pointer rounded-r-lg bg-white py-2 pl-10 pr-8 text-left text-base focus:outline-none focus:ring-0 border-none shadow-none">
                        <span className="flex items-center">
                          <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                          {selectedCategory
                            ? <>
                                <span className="ml-6 mr-2">{categorias.find(c => c.id === selectedCategory)?.icon}</span>
                                {categorias.find(c => c.id === selectedCategory)?.name}
                              </>
                            : <span className="ml-6">Todas las categorías</span>}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Listbox.Option
                          key=""
                          value=""
                          className={({ active }) =>
                            `cursor-pointer select-none relative py-2 pl-10 pr-3 ${
                              active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <span className="ml-6 block truncate ${selected ? 'font-bold' : ''}">Todas las categorías</span>
                              {selected ? (
                                <span className="absolute inset-y-0 right-2 flex items-center text-primary-600">
                                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                        {categorias.map((categoria) => (
                          <Listbox.Option
                            key={categoria.id}
                            value={categoria.id}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2 pl-10 pr-3 ${
                                active ? 'bg-primary-100 text-primary-900' : 'text-gray-900'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className="absolute left-2 top-1/2 -translate-y-1/2">{categoria.icon}</span>
                                <span className={`ml-6 block truncate ${selected ? 'font-bold' : ''}`}>{categoria.name}</span>
                                {selected ? (
                                  <span className="absolute inset-y-0 right-2 flex items-center text-primary-600">
                                    <CheckIcon className="h-4 w-4" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Listbox>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedCategory) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                      Búsqueda: &quot;{searchTerm}&quot;
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                      Categoría: {categorias.find(c => c.id === selectedCategory)?.name}
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Products Section */}
          <section>
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Cargando productos...
                </h3>
                <p className="text-gray-600">Preparando nuestra colección para ti</p>
              </div>
            ) : filteredProductos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {searchTerm || selectedCategory 
                    ? 'Intenta ajustar tus filtros de búsqueda'
                    : 'Estamos preparando nuevos productos para ti'
                  }
                </p>
                {(searchTerm || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('')
                    }}
                    className="btn-primary"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Nuestros Productos
                    </h2>
                    <p className="text-gray-600">
                      {filteredProductos.length} de {productos.length} productos disponibles
                    </p>
                  </div>
                  {cartItemCount > 0 && (
                    <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="font-medium">{cartItemCount} en tu carrito</span>
                    </div>
                  )}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                  {filteredProductos.map((producto, index) => (
                    <div
                      key={producto._id}
                      className="transform hover:scale-105 transition-all duration-300"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <ProductCard
                        producto={producto}
                        onAddToCart={() => handleAddToCart(producto)}
                      />
                    </div>
                  ))}
                </div>

                {/* Load More Button (if needed) */}
                {filteredProductos.length > 8 && (
                  <div className="text-center mt-12">
                    <button className="btn-secondary text-lg px-8 py-3">
                      Cargar más productos
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </main>

        {/* Footer CTA */}
        <section className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Contáctanos y te ayudaremos a encontrar el producto perfecto para ti
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setShowContactModal(true)}
                className="text-lg px-8 py-3 bg-black text-white rounded-lg font-semibold transition-all duration-200 border border-transparent hover:border-white hover:shadow-[0_0_10px_rgba(255,255,255,0.15)]"
              >
                Contactar
              </button>
            </div>
          </div>
        </section>

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    📞 Contáctanos
                  </h3>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={contactForm.nombre}
                      onChange={handleContactInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={contactForm.telefono}
                      onChange={handleContactInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      name="mensaje"
                      value={contactForm.mensaje}
                      onChange={handleContactInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                      placeholder="Cuéntanos qué estás buscando o cómo podemos ayudarte..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowContactModal(false)}
                      className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      Enviar mensaje
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
} 