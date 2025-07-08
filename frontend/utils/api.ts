import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smoq-proyect-production.up.railway.app'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Función genérica para hacer peticiones a la API
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Error en la petición',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('Error en apiRequest:', error)
    return {
      success: false,
      error: 'Error de conexión',
    }
  }
}

// Funciones específicas para productos
export const productosApi = {
  getAll: () => apiRequest('/api/productos'),
  getById: (id: string) => apiRequest(`/api/productos/${id}`),
  create: (producto: any, token: string) =>
    apiRequest('/api/productos', {
      method: 'POST',
      body: JSON.stringify(producto),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  update: (id: string, producto: any, token: string) =>
    apiRequest(`/api/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(producto),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  delete: (id: string, token: string) =>
    apiRequest(`/api/productos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
}

// Funciones específicas para autenticación
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
}

// Funciones específicas para pedidos
export const pedidosApi = {
  create: (pedido: {
    nombre: string
    email?: string
    telefono?: string
    productos: Array<{
      _id: string
      nombre: string
      precio: number
      cantidad: number
    }>
  }) =>
    apiRequest('/api/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedido),
    }),
}

export const configApi = {
  get: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/config`)
      return res.data
    } catch (error) {
      console.warn('Error obteniendo configuración, usando valor por defecto:', error)
      // Retornar configuración por defecto si falla
      return {
        success: true,
        config: { 
          minFreeShipping: 25000, 
          whatsappNumber: "",
          whatsappTitle: "Nuevo Pedido - SMOQ",
          whatsappDescription: "Somos SMOQ y acabas de tomar la mejor decisión de tu vida. Gracias por elegirnos!",
          whatsappGoodbye: "Enviado desde la tienda online"
        }
      }
    }
  },
  getWhatsApp: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/config`)
      return res.data
    } catch (error) {
      console.warn('Error obteniendo configuración de WhatsApp:', error)
      return {
        success: false,
        error: 'Error al obtener configuración de WhatsApp'
      }
    }
  },
  update: async (minFreeShipping: number, token: string) => {
    try {
      const res = await axios.put(`${API_URL}/api/config`, { minFreeShipping }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    } catch (error) {
      console.error('Error actualizando configuración:', error)
      return {
        success: false,
        error: 'Error al actualizar configuración'
      }
    }
  },
  updateWhatsApp: async (whatsappNumber: string, token: string) => {
    try {
      const res = await axios.put(`${API_URL}/api/config`, { whatsappNumber }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    } catch (error) {
      console.error('Error actualizando configuración de WhatsApp:', error)
      return {
        success: false,
        error: 'Error al actualizar configuración de WhatsApp'
      }
    }
  },
  updateWhatsAppMessage: async (whatsappData: {
    whatsappNumber?: string,
    whatsappTitle?: string,
    whatsappDescription?: string,
    whatsappGoodbye?: string
  }, token: string) => {
    try {
      const res = await axios.put(`${API_URL}/api/config`, whatsappData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return res.data
    } catch (error) {
      console.error('Error actualizando mensaje de WhatsApp:', error)
      return {
        success: false,
        error: 'Error al actualizar mensaje de WhatsApp'
      }
    }
  }
}

// Funciones específicas para gustos y categorías
export const gustosApi = {
  getAll: () => apiRequest('/api/config/gustos'),
  // Puedes agregar create, update, delete si lo necesitas
}

export const categoriasApi = {
  getAll: () => apiRequest('/api/config/categorias'),
  // Puedes agregar create, update, delete si lo necesitas
} 