// Validación de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validación de teléfono (formato argentino)
export const isValidPhone = (phone: string): boolean => {
  // Acepta formatos: +54 9 11 1234-5678, 11 1234-5678, 1234-5678
  const phoneRegex = /^(\+54\s?)?(9\s?)?(\d{1,2}\s?)?(\d{4}-\d{4})$/
  return phoneRegex.test(phone)
}

// Limpiar string de espacios y caracteres especiales
export const cleanString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ')
}

// Formatear precio
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(price)
}

// Validar que al menos uno de los campos de contacto esté presente
export const hasValidContact = (email: string, phone: string): boolean => {
  return (!!email && isValidEmail(email)) || (!!phone && isValidPhone(phone))
}

// Generar ID único simple
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

// Capitalizar primera letra
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Función para manejar errores de imagen
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = event.target as HTMLImageElement
  // Usar una imagen SVG simple como fallback
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNS41ODIgMTIgMTIgMTUuNTgyIDEyIDIwQzEyIDI0LjQxOCAxNS41ODIgMjggMjAgMjhDMjQuNDE4IDI4IDI4IDI0LjQxOCAyOCAyMEMyOCAxNS41ODIgMjQuNDE4IDEyIDIwIDEyWk0yMCAyNkMxNy43OTQgMjYgMTYgMjQuMjA2IDE2IDIyQzE2IDE5Ljc5NCAxNy43OTQgMTggMjAgMThDMjIuMjA2IDE4IDI0IDE5Ljc5NCAyNCAyMkMyNCAyNC4yMDYgMjIuMjA2IDI2IDIwIDI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K'
  target.onerror = null // Prevenir futuros errores
}

// Función helper para obtener el ID del gusto de forma segura
export const getGustoId = (gusto: any): string => {
  if (!gusto) return '';
  if (typeof gusto === 'string') return gusto;
  if (typeof gusto === 'object' && gusto._id) return gusto._id;
  return '';
};

// Función helper para obtener el stock de un gusto específico
export const getStockForGusto = (producto: any, gustoId: string): number => {
  if (!producto.stockPorGusto || !Array.isArray(producto.stockPorGusto)) return 0;
  
  const stockGusto = producto.stockPorGusto.find((sg: any) => {
    const sgGustoId = getGustoId(sg.gusto);
    return sgGustoId === gustoId;
  });
  
  return stockGusto ? stockGusto.stock : 0;
}; 