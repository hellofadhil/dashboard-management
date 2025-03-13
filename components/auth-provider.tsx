"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "react-toastify"

interface AuthContextType {
  user: User | null
  loading: boolean
  register: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if auth is initialized
    if (!auth) {
      toast.error("Firebase authentication failed to initialize. Please check your configuration.")
      setLoading(false)
      return () => {}
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setLoading(false)

        // Redirect logic
        if (!currentUser && !pathname.includes("/auth/")) {
          router.push("/auth/login")
        } else if (currentUser && pathname.includes("/auth/")) {
          router.push("/")
        }
      },
      (error) => {
        console.error("Auth state change error:", error)
        toast.error("Authentication error: " + error.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [pathname, router])

  const register = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase authentication is not initialized")

    try {
      await createUserWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (error: any) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase authentication is not initialized")

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/")
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = async () => {
    if (!auth) throw new Error("Firebase authentication is not initialized")

    try {
      await signOut(auth)
      toast.info("You have been logged out")
      router.push("/auth/login")
    } catch (error: any) {
      console.error("Logout error:", error)
      toast.error("Logout failed: " + error.message)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase authentication is not initialized")

    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error("Password reset error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

