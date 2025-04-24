"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronDown,
  FileText,
  DollarSign,
  HelpCircle,
} from "lucide-react"

export default function VendorSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState({
    products: true,
  })

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const isActive = (path) => {
    return pathname === path
  }

  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto fixed">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Vendor Portal</h2>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          <li>
            <Link
              href="/vendor/dashboard"
              className={`flex items-center p-2 rounded-md ${
                isActive("/vendor/dashboard")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
          </li>

          {/* Products Section */}
          <li>
            <button
              onClick={() => toggleMenu("products")}
              className={`flex items-center justify-between w-full p-2 rounded-md text-left ${
                pathname.includes("/vendor/products")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Package className="w-5 h-5 mr-3" />
                Products
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openMenus.products ? "rotate-180" : ""}`} />
            </button>
            {openMenus.products && (
              <ul className="pl-10 mt-1 space-y-1">
                <li>
                  <Link
                    href="/vendor/products"
                    className={`block p-2 rounded-md ${
                      isActive("/vendor/products")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vendor/products/add"
                    className={`block p-2 rounded-md ${
                      isActive("/vendor/products/add")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Add Product
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              href="/vendor/orders"
              className={`flex items-center p-2 rounded-md ${
                isActive("/vendor/orders")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              Orders
            </Link>
          </li>

          <li>
            <Link
              href="/vendor/analytics"
              className={`flex items-center p-2 rounded-md ${
                isActive("/vendor/analytics")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              Analytics
            </Link>
          </li>

          <li>
            <Link
              href="/vendor/payments"
              className={`flex items-center p-2 rounded-md ${
                isActive("/vendor/payments")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <DollarSign className="w-5 h-5 mr-3" />
              Payments
            </Link>
          </li>

          <li>
            <Link
              href="/vendor/reports"
              className={`flex items-center p-2 rounded-md ${
                isActive("/vendor/reports")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <FileText className="w-5 h-5 mr-3" />
              Reports
            </Link>
          </li>

          <li>
            <Link
              href="/vendor/settings"
              className={`flex items-center p-2 rounded-md ${
                isActive("/vendor/settings")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Link>
          </li>

          <li>
            <Link
              href="/vendor/help"
              className={`flex items-center p-2 rounded-md ${
                isActive("/vendor/help")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <HelpCircle className="w-5 h-5 mr-3" />
              Help & Support
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

