import React, { createContext, useContext, useReducer, useEffect } from 'react'

export interface Producto {
  _id: string
  nombre: string
  precio: number
  descripcion: string
  imagen: string
  categoria: string
  stock: number
}

export interface CartItem {
  producto: Producto
  cantidad: number
}

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Producto }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; cantidad: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

const initialState: CartState = {
  items: [],
  total: 0
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.producto._id === action.payload._id)
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.producto._id === action.payload._id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          ),
          total: state.total + action.payload.precio
        }
      }
      
      return {
        ...state,
        items: [...state.items, { producto: action.payload, cantidad: 1 }],
        total: state.total + action.payload.precio
      }
    }
    
    case 'REMOVE_ITEM': {
      const item = state.items.find(item => item.producto._id === action.payload)
      if (!item) return state
      
      return {
        ...state,
        items: state.items.filter(item => item.producto._id !== action.payload),
        total: state.total - (item.producto.precio * item.cantidad)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.producto._id === action.payload.id)
      if (!item) return state
      
      const quantityDiff = action.payload.cantidad - item.cantidad
      
      return {
        ...state,
        items: state.items.map(item =>
          item.producto._id === action.payload.id
            ? { ...item, cantidad: action.payload.cantidad }
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
  addItem: (producto: Producto) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, cantidad: number) => void
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

  const addItem = (producto: Producto) => {
    dispatch({ type: 'ADD_ITEM', payload: producto })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(id)
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, cantidad } })
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