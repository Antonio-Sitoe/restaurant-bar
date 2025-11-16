import { z } from 'zod'

// Product validators
export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  costPrice: z.number().nonnegative('Cost price must be >= 0'),
  salePrice: z.number().nonnegative('Sale price must be >= 0'),
  stockQuantity: z.number().int().default(0),
  minStock: z.number().int().nonnegative().default(0),
  maxStock: z.number().int().positive().optional(),
  unit: z.enum(['un', 'kg', 'l', 'm']).default('un'),
  taxRate: z.number().min(0).max(100).default(0),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  trackStock: z.boolean().default(true),
  allowNegativeStock: z.boolean().default(false),
})

export const updateProductSchema = productSchema.partial()

// Category validators
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  parentId: z.number().int().positive().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export const updateCategorySchema = categorySchema.partial()

// Customer validators
export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  nuit: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
})

export const updateCustomerSchema = customerSchema.partial()

// Sale validators
export const saleItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().positive('Quantity must be > 0'),
  unitPrice: z.number().nonnegative(),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.number().nonnegative().default(0),
})

export const createSaleSchema = z.object({
  customerId: z.number().int().positive().nullable().optional(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['cash', 'card', 'mpesa', 'emola', 'mixed']),
  cashReceived: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().default(0),
  notes: z.string().optional(),
})

// Stock validators
export const stockMovementSchema = z.object({
  productId: z.number().int().positive(),
  type: z.enum(['in', 'out', 'adjustment', 'return', 'damage', 'transfer']),
  quantity: z.number().refine((val) => val !== 0, 'Quantity cannot be zero'),
  notes: z.string().optional(),
  referenceType: z.string().optional(),
  referenceId: z.number().int().positive().optional(),
})

export const stockAdjustSchema = z.object({
  productId: z.number().int().positive(),
  newQuantity: z.number().int(),
  reason: z.string().min(1, 'Reason is required'),
})

// User validators
export const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'), // Can be username or email
  password: z.string().min(1, 'Password is required'),
})

export const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'cashier']),
  permissions: z.array(z.string()).optional(),
})

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(6).optional(),
})

// Setting validators
export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
})

// Report validators
export const reportPeriodSchema = z.object({
  startDate: z.number().int().positive(),
  endDate: z.number().int().positive(),
})

export const topProductsSchema = z.object({
  limit: z.number().int().positive().default(10),
  startDate: z.number().int().positive().optional(),
  endDate: z.number().int().positive().optional(),
})

// Backup validators
export const backupConfigSchema = z.object({
  frequency: z.enum(['hourly', 'daily', 'weekly']),
  time: z.string().optional(),
  retention: z.number().int().positive().default(30),
})
