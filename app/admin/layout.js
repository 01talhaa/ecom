"use client"

import { useState, useEffect } from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and has admin privileges
    if (!loading && !isAdmin()) {
      router.push("/auth/login?redirect=/admin")
    }
  }, [user, loading, router, isAdmin])

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

  // If not authenticated as admin, don't render anything (will be redirected)
  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 flex-col">
        <div className="text-red-500 text-xl mb-4">Access Denied</div>
        <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this area.</p>
        <button
          onClick={() => router.push("/auth/login?redirect=/admin")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login as Admin
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar - hidden on mobile by default */}
      <div className={`lg:block ${isSidebarOpen ? "block" : "hidden"}`}>
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 lg:ml-64">
        <AdminHeader 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          user={user}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}

