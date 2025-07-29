import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Producto } from '../types/product'

export interface CartItem {
  producto: Producto
  cantidad: number
  gustoId?: string
}

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { producto: Producto; gustoId?: string } }
  | { type: 'REMOVE_ITEM'; payload: { id: string; gustoId?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; gustoId?: string; cantidad: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

const initialState: CartState = {
  items: [],
  total: 0
}

// Función para guardar en localStorage con manejo de errores
const saveToLocalStorage = (key: string, data: any) => {
  try {
    // Comprimir datos antes de guardar
    const compressedData = JSON.stringify(data)
    
    // Verificar si los datos son demasiado grandes (más de 5MB)
    if (compressedData.length > 5 * 1024 * 1024) {
      console.warn('⚠️ Datos del carrito demasiado grandes, limpiando carrito...')
      localStorage.removeItem(key)
      return false
    }
    
    localStorage.setItem(key, compressedData)
    return true
  } catch (error) {
    console.error('❌ Error guardando en localStorage:', error)
    
    // Si es un error de cuota, limpiar localStorage y reintentar
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        console.warn('⚠️ localStorage lleno, limpiando datos antiguos...')
        localStorage.clear()
        localStorage.setItem(key, JSON.stringify(data))
        return true
      } catch (retryError) {
        console.error('❌ Error en reintento:', retryError)
        return false
      }
    }
    
    return false
  }
}

// Función para cargar desde localStorage con manejo de errores
const loadFromLocalStorage = (key: string) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('❌ Error cargando desde localStorage:', error)
    // Si hay error, limpiar el localStorage corrupto
    try {
      localStorage.removeItem(key)
    } catch (clearError) {
      console.error('❌ Error limpiando localStorage:', clearError)
    }
    return null
  }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { producto, gustoId } = action.payload
      
      // Verificar límite de items (máximo 50 items diferentes)
      if (state.items.length >= 50) {
        console.warn('⚠️ Límite de items alcanzado (50)')
        return state
      }
      
      const existingItem = state.items.find(item => item.producto._id === producto._id && item.gustoId === gustoId)
      if (existingItem) {
        // Verificar límite de cantidad por item (máximo 99)
        if (existingItem.cantidad >= 99) {
          console.warn('⚠️ Límite de cantidad alcanzado para este producto')
          return state
        }
        
        // Usar precio con descuento si está disponible
        const precio = producto.precioConDescuento || producto.precio
        
        return {
          ...state,
          items: state.items.map(item =>
            item.producto._id === producto._id && item.gustoId === gustoId
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          ),
          total: state.total + precio
        }
      }
      
      // Usar precio con descuento si está disponible
      const precio = producto.precioConDescuento || producto.precio
      
      return {
        ...state,
        items: [...state.items, { producto, cantidad: 1, gustoId }],
        total: state.total + precio
      }
    }
    case 'REMOVE_ITEM': {
      const { id, gustoId } = action.payload
      const item = state.items.find(item => item.producto._id === id && item.gustoId === gustoId)
      if (!item) return state
      
      // Usar precio con descuento si está disponible
      const precio = item.producto.precioConDescuento || item.producto.precio
      
      return {
        ...state,
        items: state.items.filter(item => !(item.producto._id === id && item.gustoId === gustoId)),
        total: state.total - (precio * item.cantidad)
      }
    }
    case 'UPDATE_QUANTITY': {
      const { id, gustoId, cantidad } = action.payload
      
      // Verificar límite de cantidad (máximo 99)
      if (cantidad > 99) {
        console.warn('⚠️ Cantidad máxima permitida: 99')
        return state
      }
      
      const item = state.items.find(item => item.producto._id === id && item.gustoId === gustoId)
      if (!item) return state
      
      // Usar precio con descuento si está disponible
      const precio = item.producto.precioConDescuento || item.producto.precio
      const quantityDiff = cantidad - item.cantidad
      
      return {
        ...state,
        items: state.items.map(item =>
          item.producto._id === id && item.gustoId === gustoId
            ? { ...item, cantidad }
            : item
        ),
        total: state.total + (precio * quantityDiff)
      }
    }
    case 'CLEAR_CART':
      return initialState
    case 'LOAD_CART':
      return action.payload
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (producto: Producto, gustoId?: string) => void
  removeItem: (id: string, gustoId?: string) => void
  updateQuantity: (id: string, gustoId: string | undefined, cantidad: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = loadFromLocalStorage('cart')
    if (savedCart) {
      try {
        dispatch({ type: 'LOAD_CART', payload: savedCart })
      } catch (error) {
        console.error('Error al cargar carrito:', error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (state.items.length > 0) {
      const success = saveToLocalStorage('cart', state)
      if (!success) {
        console.warn('⚠️ No se pudo guardar el carrito en localStorage')
      }
    } else {
      // Si el carrito está vacío, limpiar localStorage
      try {
        localStorage.removeItem('cart')
      } catch (error) {
        console.error('Error limpiando localStorage:', error)
      }
    }
  }, [state])

  const addItem = (producto: Producto, gustoId?: string) => {
    dispatch({ type: 'ADD_ITEM', payload: { producto, gustoId } })
  }

  const removeItem = (id: string, gustoId?: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, gustoId } })
  }

  const updateQuantity = (id: string, gustoId: string | undefined, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(id, gustoId)
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, gustoId, cantidad } })
    }
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider')
  }
  return context
} 