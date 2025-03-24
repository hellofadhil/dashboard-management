export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  image: string
  createdAt: number
  updatedAt: number
}

export interface ProductFormData {
  name: string
  description: string
  price: number
  category: string
  stock: number
  image: string
}

export interface ProductStats {
  totalProducts: number
  totalCategories: number
  totalValue: number
  lowStock: number
}

export interface SalesData {
  name: string
  sales: number
}

export interface CategoryData {
  name: string
  value: number
}

// Admin & Staff Management
export interface StaffMember {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "staff" | "support"
  department: string
  status: "active" | "inactive"
  permissions: string[]
  avatar?: string
  phone?: string
  createdAt: number
  lastLogin?: number
}

export interface StaffFormData {
  name: string
  email: string
  role: "admin" | "manager" | "staff" | "support"
  department: string
  status: "active" | "inactive"
  permissions: string[]
  avatar?: string
  phone?: string
}

// User Management
export interface User {
  id: string
  name: string
  email: string
  status: "active" | "inactive" | "blocked"
  avatar?: string
  phone?: string
  address?: string
  createdAt: number
  lastLogin?: number
  orders?: number
  totalSpent?: number
}

export interface UserFormData {
  name: string
  email: string
  status: "active" | "inactive" | "blocked"
  avatar?: string
  phone?: string
  address?: string
}

// Order Management
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  subtotal: number
}

export interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  shippingAddress: string
  trackingNumber?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface OrderFormData {
  userId: string
  userName: string
  userEmail: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  shippingAddress: string
  trackingNumber?: string
  notes?: string
}

// Dashboard Stats
export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  totalProducts: number
  recentOrders: Order[]
  topProducts: {
    id: string
    name: string
    sales: number
  }[]
  salesByDay: {
    date: string
    sales: number
  }[]
}

