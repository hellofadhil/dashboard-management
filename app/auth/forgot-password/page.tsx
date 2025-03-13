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
import { toast } from "react-toastify"
import { auth } from "@/lib/firebase"

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
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
    setLoading(true)

    try {
      await resetPassword(email)
      toast.success("Password reset email sent! Check your inbox for instructions.")
      setEmail("")
    } catch (err: any) {
      console.error("Password reset error:", err)

      // Handle specific Firebase auth errors with user-friendly messages
      if (err.message.includes("auth/user-not-found")) {
        toast.error("No account found with this email address.")
      } else if (err.message.includes("auth/invalid-email")) {
        toast.error("Invalid email address. Please check and try again.")
      } else {
        toast.error(err.message || "Failed to send password reset email")
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
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we&apos;ll send you a link to reset your password
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
              <Button type="submit" className="w-full" disabled={!firebaseInitialized || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-2">
              <Link href="/auth/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

