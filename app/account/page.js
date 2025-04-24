"use client"

import { useAuth } from "@/context/AuthContext"
import { ShoppingBag, Heart, CreditCard, MapPin, Settings } from "lucide-react"
import Link from "next/link"

export default function AccountDashboard() {
  const { user } = useAuth()

  const accountSections = [
    {
      title: "Orders",
      description: "View your order history and track current orders",
      icon: ShoppingBag,
      href: "/account/orders",
      color: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Wishlist",
      description: "Manage your saved items for future purchase",
      icon: Heart,
      href: "/account/wishlist",
      color: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
    },
    {
      title: "Payment Methods",
      description: "Manage your payment methods and preferences",
      icon: CreditCard,
      href: "/account/payment-methods",
      color: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Addresses",
      description: "Manage your shipping and billing addresses",
      icon: MapPin,
      href: "/account/addresses",
      color: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Account Settings",
      description: "Update your profile and preferences",
      icon: Settings,
      href: "/account/settings",
      color: "bg-gray-100 dark:bg-gray-700",
      iconColor: "text-gray-600 dark:text-gray-400",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}! Manage your account and view your orders.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Personal Information</h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{user?.name}</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</p>
            <Link
              href="/account/settings"
              className="mt-2 inline-flex text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
            >
              Edit
            </Link>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Default Shipping Address</h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">123 Main St</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">Anytown, ST 12345</p>
            <Link
              href="/account/addresses"
              className="mt-2 inline-flex text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accountSections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mb-4`}>
              <section.icon className={`h-6 w-6 ${section.iconColor}`} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{section.title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{section.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Total
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">#ORD-12345</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Mar 5, 2023</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Delivered
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$129.99</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href="/account/orders/12345" className="text-blue-600 dark:text-blue-400 hover:text-blue-500">
                    View
                  </Link>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">#ORD-12344</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Feb 22, 2023</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Delivered
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">$79.99</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href="/account/orders/12344" className="text-blue-600 dark:text-blue-400 hover:text-blue-500">
                    View
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link
            href="/account/orders"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
          >
            View all orders
          </Link>
        </div>
      </div>
    </div>
  )
}

