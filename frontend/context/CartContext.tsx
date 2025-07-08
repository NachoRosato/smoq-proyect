import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { Producto } from '../pages/index'

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

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { producto, gustoId } = action.payload
      const existingItem = state.items.find(item => item.producto._id === producto._id && item.gustoId === gustoId)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.producto._id === producto._id && item.gustoId === gustoId
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          ),
          total: state.total + producto.precio
        }
      }
      return {
        ...state,
        items: [...state.items, { producto, cantidad: 1, gustoId }],
        total: state.total + producto.precio
      }
    }
    case 'REMOVE_ITEM': {
      const { id, gustoId } = action.payload
      const item = state.items.find(item => item.producto._id === id && item.gustoId === gustoId)
      if (!item) return state
      return {
        ...state,
        items: state.items.filter(item => !(item.producto._id === id && item.gustoId === gustoId)),
        total: state.total - (item.producto.precio * item.cantidad)
      }
    }
    case 'UPDATE_QUANTITY': {
      const { id, gustoId, cantidad } = action.payload
      const item = state.items.find(item => item.producto._id === id && item.gustoId === gustoId)
      if (!item) return state
      const quantityDiff = cantidad - item.cantidad
      return {
        ...state,
        items: state.items.map(item =>
          item.producto._id === id && item.gustoId === gustoId
            ? { ...item, cantidad }
            : item
        ),
        total: state.total + (item.producto.precio * quantityDiff)
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
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (error) {
        console.error('Error al cargar carrito:', error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state))
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