import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smoq-proyect-production.up.railway.app'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Variable global para manejar la expiración del token
let tokenExpiredHandler: (() => void) | null = null

// Función para establecer el manejador de token expirado
export const setTokenExpiredHandler = (handler: () => void) => {
  tokenExpiredHandler = handler
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

    // Verificar si el token ha expirado
    if (response.status === 401 && data.message === 'Token expirado') {
      console.log('🔄 Token expirado detectado, ejecutando manejador...')
      if (tokenExpiredHandler) {
        tokenExpiredHandler()
      }
      return {
        success: false,
        error: 'Token expirado',
      }
    }

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
  getAll: (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/api/productos${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },
  getWithDiscounts: (params?: { page?: number; limit?: number; categoria?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.categoria) queryParams.append('categoria', params.categoria);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/api/productos/with-discounts${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },
  getById: (id: string) => apiRequest(`/api/productos/${id}`),
  getStockByGusto: (productoId: string, gustoId: string) => 
    apiRequest(`/api/productos/${productoId}/stock/${gustoId}`),
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
  permanentDelete: (id: string, token: string) =>
    apiRequest(`/api/productos/${id}/permanent`, {
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
  getAll: (token: string, params?: { estado?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.estado) queryParams.append('estado', params.estado)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const queryString = queryParams.toString()
    const endpoint = `/api/pedidos${queryString ? `?${queryString}` : ''}`
    
    return apiRequest(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
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
          freeShippingEnabled: true,
          descuentoGeneralEnabled: false,
          descuentoGeneralPorcentaje: 0,
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
  update: async (minFreeShipping: number, freeShippingEnabled: boolean | undefined, descuentoGeneralEnabled: boolean | undefined, descuentoGeneralPorcentaje: number | undefined, token: string) => {
    try {
      const data: any = { minFreeShipping }
      if (freeShippingEnabled !== undefined) {
        data.freeShippingEnabled = freeShippingEnabled
      }
      if (descuentoGeneralEnabled !== undefined) {
        data.descuentoGeneralEnabled = descuentoGeneralEnabled
      }
      if (descuentoGeneralPorcentaje !== undefined) {
        data.descuentoGeneralPorcentaje = descuentoGeneralPorcentaje
      }
      const res = await axios.put(`${API_URL}/api/config`, data, {
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
  create: (gusto: { nombre: string; descripcion?: string }, token: string) =>
    apiRequest('/api/config/gustos', {
      method: 'POST',
      body: JSON.stringify(gusto),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  update: (id: string, gusto: { nombre: string; descripcion?: string }, token: string) =>
    apiRequest(`/api/config/gustos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gusto),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  delete: (id: string, token: string) =>
    apiRequest(`/api/config/gustos/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
}

export const categoriasApi = {
  getAll: () => apiRequest('/api/config/categorias'),
  create: (categoria: { nombre: string; descripcion?: string }, token: string) =>
    apiRequest('/api/config/categorias', {
      method: 'POST',
      body: JSON.stringify(categoria),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  update: (id: string, categoria: { nombre: string; descripcion?: string }, token: string) =>
    apiRequest(`/api/config/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoria),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  delete: (id: string, token: string) =>
    apiRequest(`/api/config/categorias/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
} 

// Funciones específicas para backup
export const backupApi = {
  getAll: (token: string) =>
    apiRequest('/api/backup', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  create: (token: string) =>
    apiRequest('/api/backup', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  restore: (fileName: string, token: string) =>
    apiRequest(`/api/backup/restore/${fileName}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  delete: (fileName: string, token: string) =>
    apiRequest(`/api/backup/${fileName}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  clean: (keepCount: number, token: string) =>
    apiRequest('/api/backup/clean', {
      method: 'POST',
      body: JSON.stringify({ keepCount }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  download: (fileName: string, token: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://smoq-proyect-production.up.railway.app'
    const url = `${API_URL}/api/backup/download/${fileName}`
    
    // Crear un enlace temporal para descarga
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    
    // Agregar headers de autorización
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      if (response.ok) {
        return response.blob()
      }
      throw new Error('Error al descargar')
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob)
      link.href = url
      link.click()
      window.URL.revokeObjectURL(url)
    })
    .catch(error => {
      console.error('Error descargando backup:', error)
    })
  },
}

// Funciones específicas para contacto
export const contactoApi = {
  enviar: (datos: { nombre: string; email: string; telefono?: string; mensaje: string }) =>
    apiRequest('/api/contacto', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),
}