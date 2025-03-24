"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set, remove, push, update } from "firebase/database"
import type { User, UserFormData } from "@/lib/types"
import { toast } from "react-toastify"

interface UsersContextType {
  users: User[]
  loading: boolean
  addUser: (user: UserFormData) => Promise<void>
  updateUser: (id: string, user: UserFormData) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  getUserById: (id: string) => User | undefined
}

const UsersContext = createContext<UsersContextType | undefined>(undefined)

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!database) {
      setLoading(false)
      toast.error("Firebase database is not initialized")
      return () => {}
    }

    const usersRef = ref(database, "users")

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const usersArray = Object.entries(data).map(([id, user]) => ({
            id,
            ...(user as Omit<User, "id">),
          }))
          setUsers(usersArray)
        } else {
          setUsers([])
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching users data:", error)
        toast.error("Failed to load users data")
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [])

  const addUser = async (user: UserFormData) => {
    if (!database) {
      toast.error("Firebase database is not initialized")
      throw new Error("Firebase database is not initialized")
    }

    try {
      const timestamp = Date.now()
      const newUser: Omit<User, "id"> = {
        ...user,
        createdAt: timestamp,
        orders: 0,
        totalSpent: 0,
      }

      const newUserRef = push(ref(database, "users"))
      await set(newUserRef, newUser)
      toast.success("User added successfully")
    } catch (error) {
      console.error("Error adding user:", error)
      toast.error("Failed to add user")
      throw error
    }
  }

  const updateUser = async (id: string, user: UserFormData) => {
    if (!database) {
      toast.error("Firebase database is not initialized")
      throw new Error("Firebase database is not initialized")
    }

    try {
      const userRef = ref(database, `users/${id}`)
      await update(userRef, user)
      toast.success("User updated successfully")
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
      throw error
    }
  }

  const deleteUser = async (id: string) => {
    if (!database) {
      toast.error("Firebase database is not initialized")
      throw new Error("Firebase database is not initialized")
    }

    try {
      const userRef = ref(database, `users/${id}`)
      await remove(userRef)
      toast.success("User deleted successfully")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
      throw error
    }
  }

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id)
  }

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        addUser,
        updateUser,
        deleteUser,
        getUserById,
      }}
    >
      {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
  const context = useContext(UsersContext)
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider")
  }
  return context
}

