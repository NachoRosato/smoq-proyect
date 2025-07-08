import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X, Package, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useSideCart } from '../context/SideCartContext'
import { useRouter } from 'next/router'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state } = useCart()
  const { open } = useSideCart()
  const router = useRouter();

  const cartItemCount = state.items.reduce((total, item) => total + item.cantidad, 0)

  const handleProductosClick = () => {
    if (router.pathname === '/') {
      const productosSection = document.getElementById('productos')
      if (productosSection) {
        productosSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      router.push('/?scroll=productos')
    }
  }

  return (
    <nav className="sticky top-0 z-50" style={{
      background: 'linear-gradient(to right, white 0%, white 20%, #333333 50%, #1a1a1a 100%)'
    }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo_empresa.png"
              alt="Logo de la empresa"
              width={150}
              height={50}
              priority
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-auto mr-8">
            <button 
              onClick={handleProductosClick}
              className="text-white transition-all duration-300 font-medium flex items-center space-x-2 group cursor-pointer"
            >
              <Package className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">Productos</span>
            </button>
            <Link 
              href="/carrito" 
              className="text-white transition-all duration-300 font-medium flex items-center space-x-2 group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="group-hover:translate-x-1 transition-transform duration-300">Carrito</span>
            </Link>
          </div>

          {/* Cart Icon */}
          <button
            onClick={open}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white hover:bg-amber-50 text-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 ml-2 group"
            title="Ver carrito"
          >
            <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className="md:hidden absolute left-0 right-0 mx-4 mt-6 border border-gray-700 bg-black rounded-lg shadow-2xl z-50 transition-all duration-300 opacity-100 translate-y-0"
          >
            <div className="flex flex-col space-y-2 p-4">
              <button 
                onClick={() => {
                  handleProductosClick();
                  setIsMenuOpen(false);
                }}
                className="text-white px-4 py-3 rounded hover:bg-gray-800 transition-all duration-300 flex items-center space-x-3 group cursor-pointer text-left w-full"
              >
                <Package className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">Productos</span>
              </button>
              <Link 
                className="text-white px-4 py-3 rounded hover:bg-gray-800 transition-all duration-300 flex items-center space-x-3 group" 
                href="/carrito/"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-1 transition-transform duration-300">Carrito</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 