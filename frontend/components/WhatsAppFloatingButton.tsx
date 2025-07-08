import { useEffect, useState } from 'react';
import { configApi } from '../utils/api';

export default function WhatsAppFloatingButton() {
  const [numeroWhatsapp, setNumeroWhatsapp] = useState('');



  const handleClick = () => {
    console.log('Número WhatsApp:', numeroWhatsapp);
    if (!numeroWhatsapp) return;
    // Limpiar el número: quitar +, espacios, guiones, paréntesis
    const numeroLimpio = numeroWhatsapp.replace(/[^0-9]/g, '');
    const mensaje = encodeURIComponent('Hola! Quiero hacer una consulta!');
    const url = `https://wa.me/${numeroLimpio}?text=${mensaje}`;
    console.log('Enlace WhatsApp:', url);
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed bottom-8 right-8 z-50 cursor-pointer"
      onClick={()=>handleClick()}
      title="Consultar por WhatsApp"
    >
      <div
      
        className="relative bg-black rounded-full shadow-xl transition-all duration-300 ease-out hover:scale-110"
        style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span
        
          className="transition-all duration-300"
          style={{ color: 'white', fontSize: 24, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
        >
          W
        </span>
        <div
          
          className="absolute transition-all duration-300"
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '12px solid black',
            bottom: -2,
            right: 12,
            rotate: '120deg',
            transform: 'scale(1) rotate(100deg)'
          }}
        />
      </div>
    </div>
  );
} 