"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { FirebaseProvider } from "@/components/firebase-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { StaffProvider } from "@/components/staff-provider"
import { UsersProvider } from "@/components/users-provider"
import { OrdersProvider } from "@/components/orders-provider"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <ProtectedRoute>
      <FirebaseProvider>
        <StaffProvider>
          <UsersProvider>
            <OrdersProvider>
              <div className="flex h-screen overflow-hidden bg-background/50">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                  </main>
                </div>
              </div>
            </OrdersProvider>
          </UsersProvider>
        </StaffProvider>
      </FirebaseProvider>
    </ProtectedRoute>
  )
}

