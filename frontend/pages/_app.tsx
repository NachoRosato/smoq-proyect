import type { AppProps } from 'next/app'
import { CartProvider } from '../context/CartContext'
import { AuthProvider } from '../context/AuthContext'
import { AgeVerificationProvider } from '../context/AgeVerificationContext'
import { Toaster } from 'react-hot-toast'
import '../styles/globals.css'
import { SideCartProvider, useSideCart } from '../context/SideCartContext'
import SideCart from '../components/SideCart'
import { useRouter } from 'next/router'
import { SidebarProvider } from '../context/SidebarContext'
import AgeVerificationWrapper from '../components/AgeVerificationWrapper'
import Head from 'next/head'

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
  const isAdmin = router.pathname.startsWith('/admin');
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="/images/logo_empresa_2.png" />
      </Head>
      <AgeVerificationProvider>
        <AuthProvider>
          <CartProvider>
            <SideCartProvider>
                          {isAdmin ? (
              <SidebarProvider>
                <Component {...pageProps} />
                <SideCartWrapper />
              </SidebarProvider>
            ) : (
              <AgeVerificationWrapper>
                <Component {...pageProps} />
                <SideCartWrapper />
              </AgeVerificationWrapper>
            )}
            </SideCartProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  marginTop: '70px', // Reducido de 80px a 70px
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </AgeVerificationProvider>
    </>
  )
} 