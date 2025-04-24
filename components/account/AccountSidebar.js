"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { User, ShoppingBag, Heart, CreditCard, MapPin, Settings, LogOut } from "lucide-react"

export default function AccountSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/account", icon: User },
    { name: "Orders", href: "/account/orders", icon: ShoppingBag },
    { name: "Wishlist", href: "/account/wishlist", icon: Heart },
    { name: "Payment Methods", href: "/account/payment-methods", icon: CreditCard },
    { name: "Addresses", href: "/account/addresses", icon: MapPin },
    { name: "Settings", href: "/account/settings", icon: Settings },
  ]

  return (
    <div className="h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">My Account</h2>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                    } mr-3 flex-shrink-0 h-5 w-5`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={logout}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 dark:text-gray-500" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

