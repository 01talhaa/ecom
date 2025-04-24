"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import AccountSidebar from "@/components/account/AccountSidebar"
import AccountHeader from "@/components/account/AccountHeader"

export default function AccountLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Check if user is a customer or admin based on userType property
  const isCustomer = user?.userType === 'customer'
  const isAdmin = user?.userType === 'admin'

  useEffect(() => {
    // Check if user is logged in and has customer privileges
    if (!loading && !isCustomer && !isAdmin) {
      router.push("/auth/customer-login?redirect=/account")
    }
  }, [user, loading, router, isCustomer, isAdmin])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // If not authenticated as customer or admin, show access denied
  if (!isCustomer && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 flex-col">
        <div className="text-red-500 text-xl mb-4">Access Denied</div>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this area.</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar - hidden on mobile by default */}
      <div className={`lg:block ${isSidebarOpen ? "block" : "hidden"}`}>
        <AccountSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 lg:ml-64">
        <AccountHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4">{children}</main>
      </div>
    </div>
  )
}

