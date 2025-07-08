import React from 'react';

interface SidebarArrowProps {
  rotated?: boolean; // Si true, rota la flecha 180°
  className?: string;
}

// Colores de la barra lateral
const sand = '#FFF1B8'; // fondo
const sandDark = '#FFDB7E'; // borde
const white = '#FFFFFF'; // flecha

export default function SidebarArrow({ rotated = false, className = '' }: SidebarArrowProps) {
  return (
    <div
      className={`w-4 h-4 flex items-center justify-center transition-transform duration-300 ${rotated ? 'rotate-180' : ''} ${className}`}
      style={{ position: 'relative', background: sand, border: `2px solid ${sandDark}`, borderRadius: '50%' }}
    >
      {/* Flecha blanca hecha con CSS */}
      <div
        style={{
          width: '10px',
          height: '10px',
          borderLeft: `3px solid ${white}`,
          borderBottom: `3px solid ${white}`,
          borderRadius: '1px',
          position: 'absolute',
          left: '3px',
          top: '2px',
          transform: 'rotate(45deg)'
        }}
      />
    </div>
  );
} 