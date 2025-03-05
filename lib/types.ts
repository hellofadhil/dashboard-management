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

