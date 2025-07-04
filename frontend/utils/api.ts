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
  getAll: () => apiRequest('/productos'),
  getById: (id: string) => apiRequest(`/productos/${id}`),
  create: (producto: any, token: string) =>
    apiRequest('/productos', {
      method: 'POST',
      body: JSON.stringify(producto),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  update: (id: string, producto: any, token: string) =>
    apiRequest(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(producto),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  delete: (id: string, token: string) =>
    apiRequest(`/productos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
}

// Funciones específicas para autenticación
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
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
    apiRequest('/pedidos', {
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
        config: { minFreeShipping: 25000 }
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
  }
} 