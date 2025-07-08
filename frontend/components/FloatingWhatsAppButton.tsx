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
      console.log('res', res);
      if (res.success && res.config?.whatsappNumber) {
        setNumeroWhatsapp(res.config.whatsappNumber)
      }
    })
  }, [])

  const handleClick = () => {
    console.log('numeroWhatsapp', numeroWhatsapp);
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
            : '0 2px 6px rgba(0,0,0,0.12)'
        }}
      >
        <span 
          className="transition-all duration-300"
          style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            textShadow: isHovered ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
          }}
        >
          W
        </span>
        
        {/* Triangulito del diálogo - pegado al círculo */}
        <div 
          className="absolute transition-all duration-300"
        
          style={{
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '12px solid black',
            bottom: '-2px',
            right: '12px',
            rotate: '120deg',
            transform: isHovered ? 'scale(1.2) rotate(110deg)' : 'scale(1) rotate(100deg)'
          }}
        />
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