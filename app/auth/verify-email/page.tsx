"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail, CheckCircle } from "lucide-react"
import { toast } from "react-toastify"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { auth } from "@/lib/firebase"

export default function VerifyEmailPage() {
  const { user, sendVerificationEmail, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if user is already verified
  useEffect(() => {
    if (user?.emailVerified) {
      toast.success("Your email is verified! Redirecting to dashboard...")
      setTimeout(() => {
        router.push("/")
      }, 2000)
    }
  }, [user, router])

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false)
    }
  }, [countdown, resendDisabled])

  // Reload user to check verification status
  const checkVerificationStatus = async () => {
    setLoading(true)
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload()
        if (auth.currentUser.emailVerified) {
          toast.success("Your email is verified! Redirecting to dashboard...")
          setTimeout(() => {
            router.push("/")
          }, 1500)
        } else {
          toast.info("Your email is not verified yet. Please check your inbox.")
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error)
      toast.error("Failed to check verification status")
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setLoading(true)
    try {
      await sendVerificationEmail()
      setResendDisabled(true)
      setCountdown(60) // Disable resend for 60 seconds
    } catch (error) {
      console.error("Error resending verification email:", error)
      toast.error("Failed to resend verification email")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // If user is already verified, show success message
  if (user?.emailVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-4">
          <Card>
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Email Verified!</CardTitle>
              <CardDescription className="text-center">Your email has been successfully verified.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p>You will be redirected to the dashboard shortly...</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/">Go to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a verification email to {user?.email || "your email address"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              Please check your inbox and click the verification link to complete your registration. If you don't see
              the email, check your spam folder.
            </p>
            <div className="flex flex-col gap-2 mt-4">
              <Button onClick={checkVerificationStatus} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "I've verified my email"
                )}
              </Button>
              <Button variant="outline" onClick={handleResendEmail} disabled={loading || resendDisabled}>
                {resendDisabled ? `Resend email (${countdown}s)` : "Resend verification email"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="ghost" onClick={handleLogout}>
              Back to login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

