// User types
export interface User {
  id: number
  username: string
  email: string
  fullName?: string
  role: 'admin' | 'manager' | 'cashier'
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Product types
export interface Product {
  id: number
  name: string
  barcode?: string
  sku?: string
  categoryId?: number
  category?: Category
  salePrice: number
  costPrice: number
  stockQuantity: number
  minStock: number
  trackStock: boolean
  allowNegativeStock: boolean
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateProductInput {
  name: string
  barcode?: string
  sku?: string
  categoryId?: number
  salePrice: number
  costPrice: number
  stockQuantity: number
  minStock: number
  trackStock: boolean
  allowNegativeStock: boolean
}

// Category types
export interface Category {
  id: number
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

// Customer types
export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  nuit?: string
  address?: string
  totalPurchases: number
  totalOrders: number
  createdAt: string
  updatedAt?: string
}

// Sale types
export interface Sale {
  id: number
  invoiceNumber: string
  customerId?: number
  customer?: Customer
  userId: number
  user?: User
  status: 'completed' | 'cancelled' | 'pending'
  paymentMethod: 'cash' | 'card' | 'mpesa' | 'emola'
  subtotal: number
  discount: number
  taxAmount: number
  total: number
  cashReceived?: number
  change?: number
  notes?: string
  createdAt: string
  updatedAt?: string
  items: SaleItem[]
}

export interface SaleItem {
  id: number
  saleId: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface CreateSaleInput {
  customerId?: number
  items: {
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    discount?: number
  }[]
  paymentMethod: 'cash' | 'card' | 'mpesa' | 'emola'
  cashReceived?: number
  discountAmount?: number
  notes?: string
}

// Stock types
export interface StockMovement {
  id: number
  productId: number
  product?: Product
  type: 'in' | 'out' | 'adjustment' | 'sale' | 'return'
  quantity: number
  previousQuantity: number
  newQuantity: number
  referenceType?: string
  referenceId?: number
  notes?: string
  createdAt: string
}

// Settings types
export interface Setting {
  id: number
  key: string
  value: string
  type: 'string' | 'number' | 'boolean'
  description?: string
  updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

