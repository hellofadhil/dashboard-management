"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set, remove, push, update } from "firebase/database"
import type { Product, ProductFormData } from "@/lib/types"

interface FirebaseContextType {
  products: Product[]
  loading: boolean
  addProduct: (product: ProductFormData) => Promise<void>
  updateProduct: (id: string, product: ProductFormData) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const productsRef = ref(database, "products")

    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const productsArray = Object.entries(data).map(([id, product]) => ({
          id,
          ...(product as Omit<Product, "id">),
        }))
        setProducts(productsArray)
      } else {
        setProducts([])
      }
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const addProduct = async (product: ProductFormData) => {
    const timestamp = Date.now()
    const newProduct: Omit<Product, "id"> = {
      ...product,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const newProductRef = push(ref(database, "products"))
    await set(newProductRef, newProduct)
  }

  const updateProduct = async (id: string, product: ProductFormData) => {
    const updatedProduct = {
      ...product,
      updatedAt: Date.now(),
    }

    const productRef = ref(database, `products/${id}`)
    await update(productRef, updatedProduct)
  }

  const deleteProduct = async (id: string) => {
    const productRef = ref(database, `products/${id}`)
    await remove(productRef)
  }

  return (
    <FirebaseContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

export function useFirebase() {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}

