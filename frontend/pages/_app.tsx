import type { AppProps } from 'next/app'
import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import { Toaster } from 'react-hot-toast'
import '../styles/globals.css'
import { SideCartProvider, useSideCart } from '../context/SideCartContext'
import SideCart from '../components/SideCart'
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton'
import { useRouter } from 'next/router'

// Componente wrapper que usa el hook dentro del provider
function SideCartWrapper() {
  const { isOpen, close } = useSideCart()
  
  return (
    <SideCart
      isOpen={isOpen}
      onClose={close}
      onCheckout={() => { window.location.href = '/carrito' }}
    />
  )
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <AuthProvider>
      <CartProvider>
        <SideCartProvider>
          <Component {...pageProps} />
          <SideCartWrapper />
          { !router.pathname.startsWith('/admin') && <FloatingWhatsAppButton /> }
        </SideCartProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  )
} 