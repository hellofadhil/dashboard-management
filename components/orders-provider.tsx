"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set, remove, push, update } from "firebase/database"
import type { Order, OrderFormData } from "@/lib/types"
import { toast } from "react-toastify"

interface OrdersContextType {
  orders: Order[]
  loading: boolean
  addOrder: (order: OrderFormData) => Promise<void>
  updateOrder: (id: string, order: Partial<OrderFormData>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  getOrderById: (id: string) => Order | undefined
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!database) {
      setLoading(false)
      toast.error("Firebase database is not initialized")
      return () => {}
    }

    const ordersRef = ref(database, "orders")

    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const ordersArray = Object.entries(data).map(([id, order]) => ({
            id,
            ...(order as Omit<Order, "id">),
          }))
          // Sort by createdAt in descending order (newest first)
          ordersArray.sort((a, b) => b.createdAt - a.createdAt)
          setOrders(ordersArray)
        } else {
          setOrders([])
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching orders data:", error)
        toast.error("Failed to load orders data")
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [])

  const addOrder = async (order: OrderFormData) => {
    if (!database) {
      toast.error("Firebase database is not initialized")
      throw new Error("Firebase database is not initialized")
    }

    try {
      const timestamp = Date.now()
      const newOrder: Omit<Order, "id"> = {
        ...order,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      const newOrderRef = push(ref(database, "orders"))
      await set(newOrderRef, newOrder)

      // Update user's order count and total spent
      const userRef = ref(database, `users/${order.userId}`)
      const userOrdersRef = ref(database, `users/${order.userId}/orders`)
      const userTotalSpentRef = ref(database, `users/${order.userId}/totalSpent`)

      // Get current values
      const userSnapshot = await onValue(
        userRef,
        (snapshot) => {
          const userData = snapshot.val()
          if (userData) {
            const currentOrders = userData.orders || 0
            const currentTotalSpent = userData.totalSpent || 0

            // Update user data
            update(userRef, {
              orders: currentOrders + 1,
              totalSpent: currentTotalSpent + order.total,
            })
          }
        },
        { onlyOnce: true },
      )

      toast.success("Order added successfully")
    } catch (error) {
      console.error("Error adding order:", error)
      toast.error("Failed to add order")
      throw error
    }
  }

  const updateOrder = async (id: string, orderUpdates: Partial<OrderFormData>) => {
    if (!database) {
      toast.error("Firebase database is not initialized")
      throw new Error("Firebase database is not initialized")
    }

    try {
      const orderRef = ref(database, `orders/${id}`)
      await update(orderRef, {
        ...orderUpdates,
        updatedAt: Date.now(),
      })
      toast.success("Order updated successfully")
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error("Failed to update order")
      throw error
    }
  }

  const deleteOrder = async (id: string) => {
    if (!database) {
      toast.error("Firebase database is not initialized")
      throw new Error("Firebase database is not initialized")
    }

    try {
      // Get the order first to update user stats
      const order = orders.find((o) => o.id === id)
      if (order) {
        // Update user's order count and total spent
        const userRef = ref(database, `users/${order.userId}`)
        const userSnapshot = await onValue(
          userRef,
          (snapshot) => {
            const userData = snapshot.val()
            if (userData) {
              const currentOrders = userData.orders || 0
              const currentTotalSpent = userData.totalSpent || 0

              // Update user data
              update(userRef, {
                orders: Math.max(0, currentOrders - 1),
                totalSpent: Math.max(0, currentTotalSpent - order.total),
              })
            }
          },
          { onlyOnce: true },
        )
      }

      // Delete the order
      const orderRef = ref(database, `orders/${id}`)
      await remove(orderRef)
      toast.success("Order deleted successfully")
    } catch (error) {
      console.error("Error deleting order:", error)
      toast.error("Failed to delete order")
      throw error
    }
  }

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrder,
        deleteOrder,
        getOrderById,
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}

