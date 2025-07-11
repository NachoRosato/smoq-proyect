import { useState, useEffect } from 'react'
import Head from 'next/head'
import { ShoppingCart, Search, Filter, Star, TrendingUp, Zap, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { productosApi, categoriasApi } from '../utils/api'
import ProductCard from '../components/ProductCard'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { Listbox } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton'
import { useRouter } from 'next/router'
import Link from 'next/link'

export interface Producto {
  _id: string
  nombre: string
  precio: number
  descripcion: string
  imagen: string
  categoria: { _id: string; nombre: string }
  stock: number
  gustos?: { _id: string; nombre: string; descripcion?: string }[]
  stockPorGusto?: { gusto: { _id: string; nombre: string; descripcion?: string }; stock: number }[]
  activo: boolean
}

export default function Home() {
  const { addItem, state } = useCart()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const [contactForm, setContactForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  })
  const router = useRouter();
  const [categorias, setCategorias] = useState<{ _id: string; nombre: string }[]>([])

  useEffect(() => {
    loadProductos()
    categoriasApi.getAll().then(res => {
      if (res.success && Array.isArray(res.data)) {
        setCategorias(res.data)
      } else {
        setCategorias([])
      }
    })
  }, [])

  useEffect(() => {
    calculateDropdownPosition()
    window.addEventListener('scroll', calculateDropdownPosition)
    window.addEventListener('resize', calculateDropdownPosition)
    
    return () => {
      window.removeEventListener('scroll', calculateDropdownPosition)
      window.removeEventListener('resize', calculateDropdownPosition)
    }
  }, [])

  useEffect(() => {
    if (router.query.scroll === 'productos') {
      const productosSection = document.getElementById('productos');
      if (productosSection) {
        setTimeout(() => {
          productosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }
  }, [router.query.scroll]);

  const loadProductos = async () => {
    try {
      setLoading(true)
      const response = await productosApi.getAll() as { success: boolean, data?: Producto[] }
      if (response.success && response.data) {
        setProductos(response.data || [])
      } else {
        toast.error('Error al cargar productos')
      }
    } catch {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (producto: Producto, gustoId?: string) => {
    addItem(producto, gustoId)
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

  const calculateDropdownPosition = () => {
    const viewportHeight = window.innerHeight
    const searchSection = document.querySelector('[data-search-section]')
    
    if (searchSection) {
      const rect = searchSection.getBoundingClientRect()
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top
      
      // Si hay menos de 300px abajo, abrir hacia arriba
      if (spaceBelow < 300 && spaceAbove > 200) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }

  const filteredProductos = productos.filter(producto => {
    if (!producto.categoria || !producto.activo) return false;
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || (producto.categoria && producto.categoria._id === selectedCategory)
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
        <section className="relative overflow-hidden" style={{background: 'linear-gradient(to right, rgb(0 0 0) 0%, rgb(0 0 0) 50%, rgb(147 133 90) 100%)'}}>
          <div className="absolute inset-0" style={{background: 'rgba(0,0,0,0.08)'}}></div>
          <div className="relative container mx-auto px-4 py-16 lg:py-24">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-6 gap-4">
                {/*
                <Image
                  src="/images/logo_empresa_2.png"
                  alt="Logo empresa 2"
                  width={140}
                  height={140}
                  className="h-[100px] w-auto"
                  priority
                />
                */}
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-none">
                  SMOQ
                </h1>
              </div>
              <p className="text-xl lg:text-2xl text-white mb-8 leading-relaxed">
                Descubre productos únicos que cuentan historias. 
                <br />
                <span className="font-semibold">Calidad, estilo y atención personalizada.</span>
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div
                  className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 border-2 border-white border-opacity-30 transition-all duration-300 hover:scale-105 hover:border-opacity-100 cursor-pointer hover-brown-shadow"
                >
                  <TrendingUp className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgb(147, 133, 90)' }} />
                  <div className="text-3xl font-extrabold text-white drop-shadow-lg">+10.000</div>
                  <div className="text-base font-semibold text-white">Productos Vendidos</div>
                </div>
                <div
                  className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 border-2 border-white border-opacity-30 transition-all duration-300 hover:scale-105 hover:border-opacity-100 cursor-pointer hover-brown-shadow"
                >
                  <Star className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgb(147, 133, 90)' }} />
                  <div className="text-3xl font-extrabold text-white drop-shadow-lg">4.9/5</div>
                  <div className="text-base font-semibold text-white">Satisfacción</div>
                </div>
                <div
                  className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 border-2 border-white border-opacity-30 transition-all duration-300 hover:scale-105 hover:border-opacity-100 cursor-pointer hover-brown-shadow"
                >
                  <Zap className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgb(147, 133, 90)' }} />
                  <div className="text-3xl font-extrabold text-white drop-shadow-lg">24hs</div>
                  <div className="text-base font-semibold text-white">Envío Rápido</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave separator */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 rotate-180">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#FFF9E1" />
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#FFF1B8" />
            </svg>
          </div>
        </section>

        <main className="container mx-auto px-4 py-12">
          {/* Search and Filters Section */}
          <section className="mb-12" data-search-section>
            <div className="rounded-2xl shadow-xl p-6 lg:p-8" style={{
              background: 'linear-gradient(135deg, rgb(0 0 0) 0%, rgb(21 21 21) 50%, rgb(159, 129, 51) 100%)'
            }}>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search + Category Filter unificados */}
                <div className="w-full flex items-center rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl" style={{
                  background: 'linear-gradient(135deg, white 0%, #FFF9E1 100%)',
                  border: '2px solid rgba(255, 219, 126, 0.4)'
                }}>
                  {/* Input de búsqueda */}
                  <div className="flex-1 relative">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      isSearchFocused ? 'text-amber-600' : 'text-gray-600'
                    }`} />
                    <input
                      type="text"
                      placeholder="¿Qué estás buscando?"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-none text-base rounded-l-xl placeholder-gray-600"
                      style={{ color: 'rgb(124, 79, 0)' }}
                    />
                  </div>
                  {/* Divider visual elegante */}
                  <div className="h-10 w-px mx-3" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255, 219, 126, 0.6), transparent)' }} />
                  {/* Select de categorías con ícono de filtro dentro */}
                  <div className="relative w-48 flex-shrink-0">
                    <Listbox value={selectedCategory} onChange={setSelectedCategory}>
                      <Listbox.Button className="relative w-full cursor-pointer rounded-r-xl py-4 pl-12 pr-10 text-left text-base focus:outline-none focus:ring-0 border-none shadow-none transition-all duration-300 hover:bg-amber-50" style={{ color: 'rgb(124, 79, 0)' }}>
                        <span className="flex items-center">
                          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                          {selectedCategory
                            ? <span className="ml-6 font-medium">{categorias.find(c => c._id === selectedCategory)?.nombre}</span>
                            : <span className="ml-6 font-medium">Todas las categorías</span>}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-600 transition-transform duration-300" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className={`absolute z-10 bg-white shadow-2xl max-h-96 rounded-xl py-4 text-base ring-1 ring-amber-200 ring-opacity-50 focus:outline-none sm:text-sm border border-amber-100 ${
                        dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                      }`} style={{
                        width: 'calc(100% + 2rem)',
                        left: '-1rem',
                        minWidth: '280px'
                      }}>
                        <Listbox.Option
                          key=""
                          value=""
                          className={({ active }) =>
                            `cursor-pointer select-none relative py-5 pl-14 pr-6 transition-all duration-200 ${
                              active ? 'bg-amber-50 text-amber-900' : 'text-gray-900'
                            }`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                              <span className="ml-8 block truncate font-medium">Todas las categorías</span>
                              {selected ? (
                                <span className="absolute inset-y-0 right-5 flex items-center text-amber-600">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                        {categorias.map((categoria) => (
                          <Listbox.Option
                            key={categoria._id}
                            value={categoria._id}
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-5 pl-14 pr-6 transition-all duration-200 ${
                                active ? 'bg-amber-50 text-amber-900' : 'text-gray-900'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className="ml-8 block truncate font-medium">{categoria.nombre}</span>
                                {selected ? (
                                  <span className="absolute inset-y-0 right-5 flex items-center text-amber-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
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

              {/* Active filters display */}
              {(searchTerm || selectedCategory) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {searchTerm && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105" style={{
                      background: 'linear-gradient(135deg, #FFF1B8 0%, #FFDB7E 100%)',
                      color: 'rgb(124, 79, 0)',
                      border: '1px solid rgba(255, 219, 126, 0.5)'
                    }}>
                      🔍 Búsqueda: &quot;{searchTerm}&quot;
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 hover:text-amber-800 transition-colors duration-200"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105" style={{
                      background: 'linear-gradient(135deg, #FFF1B8 0%, #FFDB7E 100%)',
                      color: 'rgb(124, 79, 0)',
                      border: '1px solid rgba(255, 219, 126, 0.5)'
                    }}>
                      📂 {categorias.find(c => c._id === selectedCategory)?.nombre}
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="ml-2 hover:text-amber-800 transition-colors duration-200"
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
          <section id="productos" className="relative">
            {/* Subtle background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
            
            <div className="relative z-10">
              {loading ? (
                <div className="text-center py-20">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-gray-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Preparando tu experiencia
                  </h3>
                  <p className="text-gray-600 font-medium">Cargando nuestra colección exclusiva...</p>
                </div>
              ) : filteredProductos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <ShoppingCart className="w-16 h-16 text-gray-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">?</span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                    No encontramos productos
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto font-medium">
                    {searchTerm || selectedCategory 
                      ? 'Intenta ajustar tus filtros de búsqueda'
                      : 'Estamos preparando nuevos productos exclusivos para ti'
                    }
                  </p>
                  {(searchTerm || selectedCategory) && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('')
                      }}
                      className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Enhanced Results Header */}
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6 shadow-lg">
                      <Package className="w-8 h-8 text-gray-700" />
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-800">
                      Nuestros Productos
                    </h2>
                    <p className="text-lg text-gray-600 font-medium mb-6">
                      {filteredProductos.length} de {productos.length} productos exclusivos
                    </p>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="text-3xl font-bold text-gray-700 mb-2">{productos.filter(p => p.activo).length}</div>
                        <div className="text-sm font-medium text-gray-600">Productos Activos</div>
                      </div>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="text-3xl font-bold text-gray-700 mb-2">{filteredProductos.length}</div>
                        <div className="text-sm font-medium text-gray-600">Mostrados</div>
                      </div>
                      {cartItemCount > 0 && (
                        <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl p-6 shadow-lg text-white hover:shadow-xl transition-all duration-300">
                          <div className="text-3xl font-bold mb-2">{cartItemCount}</div>
                          <div className="text-sm font-medium opacity-90">En tu carrito</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProductos.map((producto, index) => (
                      <div
                        key={producto._id}
                        className="group"
                        style={{
                          animationDelay: `${index * 150}ms`
                        }}
                      >
                        <ProductCard
                          producto={producto}
                          onAddToCart={(gustoId) => handleAddToCart(producto, gustoId)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Load More Button */}
                  {filteredProductos.length > 8 && (
                    <div className="text-center mt-16">
                      <button className="group relative px-12 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                        <span className="relative z-10">Cargar más productos</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>

        {/* Footer Rediseñado coherente con el navbar */}
        <footer className="pt-16 pb-8 mt-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgb(0 0 0) 0%, rgb(21 21 21) 50%, rgb(30 24 9) 100%)' }}>
          <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-start gap-12 relative z-10">
            {/* Logo y slogan */}
            <div className="mb-8 md:mb-0 flex-1 min-w-[220px]">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow">SMOQ</span>
              </div>
              <p className="text-gray-200 text-base max-w-xs mb-4">Productos únicos, atención personalizada y calidad garantizada. ¡Viví la experiencia SMOQ!</p>
              <div className="flex gap-4 mt-4">
                <a href="https://wa.me/" target="_blank" rel="noopener" className="hover:text-[rgb(124,79,0)] transition-colors text-white"><svg width="24" height="24" fill="currentColor"><path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.12.55 4.18 1.6 6.01L0 24l6.18-1.62A12.07 12.07 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.23-3.48-8.52zM12 22c-1.85 0-3.66-.5-5.23-1.44l-.37-.22-3.67.96.98-3.58-.24-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.91 1.13-.17.19-.34.21-.63.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.29-1 1-.99 2.43.01 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34z"/></svg></a>
                <a href="mailto:info@smoq.com" className="hover:text-[rgb(124,79,0)] transition-colors text-white"><svg width="24" height="24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm0 12H4V8.99l8 6.99 8-6.99V18z"/></svg></a>
                <a href="#" className="hover:text-[rgb(124,79,0)] transition-colors text-white"><svg width="24" height="24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.2 1.64 4.16c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.84 1.94 3.62-.72-.02-1.39-.22-1.98-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.9 3.97 2.93A8.6 8.6 0 0 1 2 19.54 12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.36 8.36 0 0 1-2.54.7z"/></svg></a>
              </div>
            </div>
            {/* Links */}
            <div className="flex-1 min-w-[180px] mb-8 md:mb-0">
              <h4 className="text-lg font-bold mb-4 text-[rgb(124,79,0)]">Enlaces útiles</h4>
              <ul className="space-y-2 text-gray-200">
                <li><Link href="/" className="hover:text-[rgb(124,79,0)] transition-colors">Inicio</Link></li>
                <li><Link href="/carrito" className="hover:text-[rgb(124,79,0)] transition-colors">Carrito</Link></li>
                <li><a href="#productos" className="hover:text-[rgb(124,79,0)] transition-colors">Productos</a></li>
                <li><a href="#" className="hover:text-[rgb(124,79,0)] transition-colors">Contacto</a></li>
              </ul>
            </div>
            {/* Contacto */}
            <div className="flex-1 min-w-[220px]">
              <h4 className="text-lg font-bold mb-4 text-[rgb(124,79,0)]">Contacto</h4>
              <ul className="space-y-2 text-gray-200">
                <li><span className="font-semibold">Email:</span> info@smoq.com</li>
                <li><span className="font-semibold">WhatsApp:</span> +54 9 11 1234-5678</li>
                <li><span className="font-semibold">Dirección:</span> Buenos Aires, Argentina</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center text-gray-400 text-sm">© {new Date().getFullYear()} SMOQ. Todos los derechos reservados.</div>
        </footer>

        {/* Contact Modal Rediseñado coherente con el navbar */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-[#181818] via-[#222] to-[rgb(124,79,0)] rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[rgb(124,79,0)]">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">
                    📞 Contactar con SMOQ
                  </h3>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="text-gray-400 hover:text-[rgb(124,79,0)] transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={contactForm.nombre}
                      onChange={handleContactInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[rgb(124,79,0)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(124,79,0)] focus:border-[rgb(124,79,0)] bg-white text-[rgb(124,79,0)] placeholder-gray-400"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-[rgb(124,79,0)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(124,79,0)] focus:border-[rgb(124,79,0)] bg-white text-[rgb(124,79,0)] placeholder-gray-400"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={contactForm.telefono}
                      onChange={handleContactInputChange}
                      className="w-full px-4 py-3 border-2 border-[rgb(124,79,0)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(124,79,0)] focus:border-[rgb(124,79,0)] bg-white text-[rgb(124,79,0)] placeholder-gray-400"
                      placeholder="+54 9 11 1234-5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">
                      Mensaje *
                    </label>
                    <textarea
                      name="mensaje"
                      value={contactForm.mensaje}
                      onChange={handleContactInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-[rgb(124,79,0)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(124,79,0)] focus:border-[rgb(124,79,0)] bg-white text-[rgb(124,79,0)] placeholder-gray-400 resize-none"
                      placeholder="Cuéntanos qué estás buscando o cómo podemos ayudarte..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowContactModal(false)}
                      className="flex-1 px-4 py-3 text-[rgb(124,79,0)] bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold border border-[rgb(124,79,0)] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-[rgb(124,79,0)] text-white rounded-xl font-semibold hover:bg-[rgb(90,57,0)] transition-colors border border-[rgb(124,79,0)]"
                    >
                      Enviar mensaje
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        <FloatingWhatsAppButton />
      </div>
      <style jsx>{`
        .hover-brown-shadow:hover {
          box-shadow: 0 4px 32px 0 rgba(255,255,255,0.18);
        }
      `}</style>
    </>
  )
} 