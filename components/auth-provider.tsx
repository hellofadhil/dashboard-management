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
  sendEmailVerification,
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
  sendVerificationEmail: () => Promise<void>
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

        // Redirect logic - only redirect to dashboard if user is verified
        if (!currentUser && !pathname.includes("/auth/")) {
          router.push("/auth/login")
        } else if (currentUser && pathname.includes("/auth/")) {
          // Only redirect to dashboard if email is verified
          if (currentUser.emailVerified) {
            router.push("/")
          } else if (!pathname.includes("/auth/verify-email")) {
            // If email is not verified and not on verify-email page, redirect to verify-email page
            router.push("/auth/verify-email")
          }
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
      // Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Send verification email using Firebase's built-in method
      await sendEmailVerification(user)

      // Also send a custom email using our API route
      try {
        // Generate verification link - Firebase will handle this automatically
        // but we're also sending our own custom email
        const verificationLink = `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(email)}`

        await fetch("/api/send-verification-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            verificationLink,
          }),
        })
      } catch (emailError) {
        console.error("Error sending custom verification email:", emailError)
        // Continue even if custom email fails, as Firebase's email was already sent
      }

      // Redirect to verification page
      router.push("/auth/verify-email")

      toast.success("Account created! Please check your email to verify your account.")
    } catch (error: any) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase authentication is not initialized")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check if email is verified
      if (!user.emailVerified) {
        // Sign out the user if email is not verified
        await signOut(auth)
        throw new Error("auth/email-not-verified")
      }

      toast.success("Login successful!")
      router.push("/")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific error for unverified email
      if (error.message === "auth/email-not-verified") {
        throw new Error("auth/email-not-verified")
      }

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

  const sendVerificationEmail = async () => {
    if (!auth || !auth.currentUser) throw new Error("No authenticated user found")

    try {
      await sendEmailVerification(auth.currentUser)

      // Also send custom email
      try {
        const email = auth.currentUser.email
        const verificationLink = `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(email || "")}`

        await fetch("/api/send-verification-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            verificationLink,
          }),
        })
      } catch (emailError) {
        console.error("Error sending custom verification email:", emailError)
      }

      toast.success("Verification email sent! Please check your inbox.")
    } catch (error: any) {
      console.error("Error sending verification email:", error)
      toast.error("Failed to send verification email: " + error.message)
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
        sendVerificationEmail,
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

