"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import VendorSidebar from "@/components/vendor/VendorSidebar"
import VendorHeader from "@/components/vendor/VendorHeader"

export default function VendorLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user, loading, isVendor, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and has vendor privileges
    if (!loading && !isVendor() && !isAdmin()) {
      router.push("/auth/vendor-login?redirect=/vendor/dashboard")
    }
  }, [user, loading, router, isVendor, isAdmin])

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

  // If not authenticated as vendor or admin, show access denied
  if (!isVendor() && !isAdmin()) {
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
        <VendorSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 lg:ml-64">
        <VendorHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4">{children}</main>
      </div>
    </div>
  )
}

