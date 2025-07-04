import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import Link from 'next/link'
import React, { useRef } from 'react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, auth } = useAuth()
  const router = useRouter()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push('/admin/dashboard')
    }
  }, [auth.isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setIsLoading(true)
    
    try {
      const success = await login(email, password)
      
      if (success) {
        toast.success('Login exitoso')
        router.push('/admin/dashboard')
      } else {
        toast.error('Credenciales inválidas')
      }
    } catch (error) {
      console.error('Error en login:', error)
      toast.error('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login - SMOQ Tienda</title>
      </Head>
      {/* Fondo de cielo estrellado */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarryBackground />
      </div>
      {/* Contenido del login */}
      <div className="min-h-screen relative z-10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white drop-shadow-sm">
              🔐 Panel Administrativo
            </h2>
            <p className="mt-2 text-sm text-gray-200 drop-shadow-sm">
              Inicia sesión para gestionar tu tienda
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="admin@tudominio.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow text-sm font-medium text-white bg-black hover:bg-gray-900 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>

            {/* Back to store */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-block text-sm text-black transition-transform duration-200 hover:scale-105"
                style={{ fontWeight: 500 }}
              >
                <span style={{ color: 'black', fontWeight: 700, fontSize: '1.1em', marginRight: 4 }}>←</span> Volver a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StarryBackground() {
  // Parámetros
  const STAR_COUNT = 80;
  const MOVING_STARS = 20; // 20 estrellas se mueven, el resto parpadea
  const [stars, setStars] = React.useState(() => {
    return Array.from({ length: STAR_COUNT }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      const isMoving = i < MOVING_STARS;
      return {
        id: i,
        size,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: 0.7 + Math.random() * 0.3,
        isMoving,
        // Solo para las que se mueven:
        destX: Math.random() * 100,
        destY: Math.random() * 100,
        speed: 0.05 + Math.random() * 0.07, // % por frame
        twinkle: !isMoving && Math.random() > 0.5,
      };
    });
  });

  // Ref para evitar dependencias en el efecto
  const starsRef = useRef(stars);
  starsRef.current = stars;

  React.useEffect(() => {
    let animationId: number;
    function animate() {
      setStars(prevStars => prevStars.map(star => {
        if (!star.isMoving) return star;
        // Movimiento lineal hacia el destino
        const dx = star.destX - star.x;
        const dy = star.destY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) {
          // Nuevo destino aleatorio y velocidad
          return {
            ...star,
            destX: Math.random() * 100,
            destY: Math.random() * 100,
            speed: 0.03 + Math.random() * 0.09,
          };
        }
        // Movimiento proporcional a la distancia
        const moveX = dx * star.speed / dist;
        const moveY = dy * star.speed / dist;
        return {
          ...star,
          x: star.x + moveX,
          y: star.y + moveY,
        };
      }));
      animationId = requestAnimationFrame(animate);
    }
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Twinkle effect para las estrellas fijas
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStars(prevStars => prevStars.map(star => {
        if (!star.twinkle) return star;
        let newOpacity = star.opacity + (Math.random() - 0.5) * 0.1;
        newOpacity = Math.max(0.6, Math.min(1, newOpacity));
        return { ...star, opacity: newOpacity };
      }));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full absolute inset-0 bg-[#101020] overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: `${star.y}%`,
            left: `${star.x}%`,
            opacity: star.opacity,
            boxShadow: `0 0 ${star.size * 4}px ${star.size / 2}px white`,
            transition: star.isMoving ? 'none' : 'opacity 1s',
          }}
        />
      ))}
    </div>
  );
} 