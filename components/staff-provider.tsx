"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { database } from "@/lib/firebase"
import { ref, onValue, set, remove, push, update } from "firebase/database"
import type { StaffMember, StaffFormData } from "@/lib/types"
import { toast } from "react-toastify"

interface StaffContextType {
  staff: StaffMember[]
  loading: boolean
  addStaffMember: (staffMember: StaffFormData) => Promise<void>
  updateStaffMember: (id: string, staffMember: StaffFormData) => Promise<void>
  deleteStaffMember: (id: string) => Promise<void>
  getStaffMemberById: (id: string) => StaffMember | undefined
}

const StaffContext = createContext<StaffContextType | undefined>(undefined)

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!database) {
      setLoading(false)
      toast.error("Firebase database is not initialized")
      return () => {}
    }

    const staffRef = ref(database, "staff")

    const unsubscribe = onValue(
      staffRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const staffArray = Object.entries(data).map(([id, staffMember]) => ({
            id,
            ...(staffMember as Omit<StaffMember, "id">),
          }))
          setStaff(staffArray)
        } else {
          setStaff([])
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching staff data:", error)
        toast.error("Failed to load staff data")
        setLoading(false)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [])

  const addStaffMember = async (staffMember: StaffFormData) => {
    if (!database) {
      toast.error("Firebase database is not initialized")
      throw new Error("Firebase database is not initialized")
    }

    try {
      const timestamp = Date.now()
      const newStaffMember: Omit<StaffMember, "id"> = {
        ...staffMember,
        createdAt: timestamp,
      }

      const newStaffRef = push(ref(database, "staff"))
      await set(newStaffRef, newStaffMember)
      toast.success("Staff member added successfully")
    } catch (error) {
      console.error("Error adding staff member:", error)
      toast.error("Failed to add staff member")
      throw error
    }
  }

  const updateStaffMember = async (id: string, staffMember: StaffFormData) => {
    if (!database) {
      toast.error("Firebase database is not initialized")
      throw new Error("Firebase database is not initialized")
    }

    try {
      const staffRef = ref(database, `staff/${id}`)
      await update(staffRef, {
        ...staffMember,
        updatedAt: Date.now(),
      })
      toast.success("Staff member updated successfully")
    } catch (error) {
      console.error("Error updating staff member:", error)
      toast.error("Failed to update staff member")
      throw error
    }
  }

  const deleteStaffMember = async (id: string) => {
    if (!database) {
      toast.error("Firebase database is not initialized")
      throw new Error("Firebase database is not initialized")
    }

    try {
      const staffRef = ref(database, `staff/${id}`)
      await remove(staffRef)
      toast.success("Staff member deleted successfully")
    } catch (error) {
      console.error("Error deleting staff member:", error)
      toast.error("Failed to delete staff member")
      throw error
    }
  }

  const getStaffMemberById = (id: string) => {
    return staff.find((member) => member.id === id)
  }

  return (
    <StaffContext.Provider
      value={{
        staff,
        loading,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        getStaffMemberById,
      }}
    >
      {children}
    </StaffContext.Provider>
  )
}

export function useStaff() {
  const context = useContext(StaffContext)
  if (context === undefined) {
    throw new Error("useStaff must be used within a StaffProvider")
  }
  return context
}

