import { useEffect, useState } from 'react'
import { configApi } from '../utils/api'

export default function FloatingWhatsAppButton() {
  const [visible, setVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('')

  useEffect(() => {
    // Animación de aparición al montar
    setTimeout(() => setVisible(true), 300)
    // Obtener número de WhatsApp del backend
    configApi.get().then(res => {
      if (res.success && res.config?.whatsappNumber) {
        setNumeroWhatsapp(res.config.whatsappNumber)
      }
    })
  }, [])

  const handleClick = () => {
    if (!numeroWhatsapp) return
    const numeroLimpio = numeroWhatsapp.replace(/[^0-9]/g, '')
    const mensaje = encodeURIComponent('Hola! Quiero hacer una consulta!')
    const url = `https://wa.me/${numeroLimpio}?text=${mensaje}`
    window.open(url, '_blank')
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-500 cursor-pointer
        ${visible ? 'opacity-100 scale-100 animate-bounce-in' : 'opacity-0 scale-75 pointer-events-none'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      title="Consultar por WhatsApp"
    >
      {/* Círculo principal */}
      <div
        
        className="relative bg-black rounded-full shadow-xl transition-all duration-300 ease-out"
        style={{ 
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
          boxShadow: isHovered 
            ? '0 0 8px 2px rgba(255,255,255,0.18)'
            : '0 2px 6px rgba(0,0,0,0.12)',
          paddingLeft: '1px',
          paddingBottom: '2px'
        }}
      >
        <svg 
          width="36" 
          height="36" 
          fill="currentColor" 
          viewBox="0 0 24 24"
          className="transition-all duration-300"
          style={{
            color: 'white',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            filter: isHovered ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none'
          }}
        >
          <path d="M20.52 3.48A12.07 12.07 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.12.55 4.18 1.6 6.01L0 24l6.18-1.62A12.07 12.07 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.23-3.48-8.52zM12 22c-1.85 0-3.66-.5-5.23-1.44l-.37-.22-3.67.96.98-3.58-.24-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.91 1.13-.17.19-.34.21-.63.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.29-1 1-.99 2.43.01 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.7-.7 1.94-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34z"/>
        </svg>

      </div>
      
      {/* Efecto de pulso cuando está hover */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(0, 0, 0, 0.2) 0%, transparent 70%)',
            animation: 'pulse 1.5s infinite'
          }}
        />
      )}
    </div>
  )
}

// Animación personalizada para bounce-in (agregar a globals.css):
// .animate-bounce-in {
//   animation: bounce-in 0.7s cubic-bezier(.68,-0.55,.27,1.55);
// }
// @keyframes bounce-in {
//   0% { opacity: 0; transform: scale(0.5); }
//   60% { opacity: 1; transform: scale(1.1); }
//   80% { transform: scale(0.95); }
//   100% { opacity: 1; transform: scale(1); }
// }
// 
// @keyframes pulse {
//   0%, 100% { opacity: 0.5; transform: scale(1); }
//   50% { opacity: 0.8; transform: scale(1.05); }
// } 