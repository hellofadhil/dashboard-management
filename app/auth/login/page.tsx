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

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
      toast.error("Cannot login: Firebase authentication is not initialized")
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      toast.success("Login successful!")
    } catch (err: any) {
      console.error("Login error:", err)

      // Handle specific Firebase auth errors with user-friendly messages
      if (err.message.includes("auth/invalid-credential")) {
        toast.error("Invalid email or password. Please try again.")
      } else if (err.message.includes("auth/user-not-found")) {
        toast.error("No account found with this email. Please register first.")
      } else if (err.message.includes("auth/wrong-password")) {
        toast.error("Incorrect password. Please try again.")
      } else if (err.message.includes("auth/too-many-requests")) {
        toast.error("Too many failed login attempts. Please try again later or reset your password.")
      } else {
        toast.error(err.message || "Failed to login")
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
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
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
              <Button type="submit" className="w-full" disabled={!firebaseInitialized || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-2">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

