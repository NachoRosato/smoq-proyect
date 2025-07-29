export interface Producto {
  _id: string
  nombre: string
  precio: number
  descuentoPorcentaje?: number
  precioOriginal?: number
  precioConDescuento?: number
  tieneDescuento?: boolean
  tipoDescuento?: 'individual' | 'general' | null
  descripcion: string
  imagen: string
  imagenes?: string[]
  categoria: { _id: string; nombre: string }
  stock: number
  activo?: boolean
  categoriaEliminada?: boolean
  fechaDesactivacion?: string
  gustos?: { _id: string; nombre: string; descripcion?: string }[]
  stockPorGusto?: { gusto: { _id: string; nombre: string; descripcion?: string }; stock: number }[]
  createdAt?: string
  updatedAt?: string
}