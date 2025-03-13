"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { toast } from "react-toastify"

export default function RegisterPage() {
  const { register } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [firebaseInitialized, setFirebaseInitialized] = useState(true)

  useEffect(() => {
    // Check if Firebase Auth is initialized
    if (!auth) {
      setFirebaseInitialized(false)
      toast.error("Firebase authentication is not initialized. Please check your configuration.")
    } else {
      setFirebaseInitialized(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firebaseInitialized) {
      toast.error("Cannot register: Firebase authentication is not initialized")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      await register(email, password)
      toast.success("Account created successfully! You are now logged in.")
    } catch (err: any) {
      console.error("Registration error:", err)

      // Handle specific Firebase auth errors with user-friendly messages
      if (err.message.includes("auth/email-already-in-use")) {
        toast.error("This email is already registered. Please login instead.")
      } else if (err.message.includes("auth/invalid-email")) {
        toast.error("Invalid email address. Please check and try again.")
      } else if (err.message.includes("auth/weak-password")) {
        toast.error("Password is too weak. Please use a stronger password.")
      } else {
        toast.error(err.message || "Failed to create an account")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">Enter your email and password to register</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={!firebaseInitialized || loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!firebaseInitialized || loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={!firebaseInitialized || loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={!firebaseInitialized || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-2">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

