"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, Settings } from "lucide-react"

export default function VendorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalSales: 0,
    monthlyRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching vendor dashboard data
    setTimeout(() => {
      setStats({
        totalProducts: 24,
        activeProducts: 18,
        pendingProducts: 3,
        totalOrders: 156,
        pendingOrders: 12,
        totalSales: 12450,
        monthlyRevenue: 3250,
        recentOrders: [
          { id: "ORD-1001", date: "2023-07-10", customer: "John Doe", total: 125.0, status: "Delivered" },
          { id: "ORD-1002", date: "2023-07-09", customer: "Jane Smith", total: 89.5, status: "Processing" },
          { id: "ORD-1003", date: "2023-07-08", customer: "Robert Johnson", total: 210.0, status: "Shipped" },
          { id: "ORD-1004", date: "2023-07-07", customer: "Emily Davis", total: 65.0, status: "Processing" },
        ],
        lowStockProducts: [
          { id: "P1001", name: "Premium Cotton T-Shirt", stock: 5, minStock: 10 },
          { id: "P1002", name: "Wireless Headphones", stock: 3, minStock: 5 },
          { id: "P1003", name: "Smart Watch", stock: 8, minStock: 10 },
        ],
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name || "Vendor"}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            href="/vendor/products/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Package className="w-4 h-4 mr-2" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Products</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalProducts}</h3>
              <div className="flex items-center mt-2">
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {stats.activeProducts} active
                </span>
                <span className="mx-1 text-gray-400">•</span>
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  {stats.pendingProducts} pending
                </span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Orders</p>
              <h3 className="text-3xl font-bold mt-1">{stats.totalOrders}</h3>
              <div className="flex items-center mt-2">
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                  {stats.pendingOrders} pending
                </span>
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Total Sales</p>
              <h3 className="text-3xl font-bold mt-1">${stats.totalSales.toLocaleString()}</h3>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">12% from last month</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Monthly Revenue</p>
              <h3 className="text-3xl font-bold mt-1">${stats.monthlyRevenue.toLocaleString()}</h3>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">8% from last month</span>
              </div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Low Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link href="/vendor/orders" className="text-blue-600 dark:text-blue-400 text-sm flex items-center">
              View All <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{order.customer}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : order.status === "Processing"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Low Stock Products</h2>
            <Link href="/vendor/products" className="text-blue-600 dark:text-blue-400 text-sm flex items-center">
              View All <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Min Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.lowStockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{product.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">{product.stock}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{product.minStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            href="/vendor/products/add"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <Package className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium">Add Product</span>
          </Link>

          <Link
            href="/vendor/orders"
            className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <ShoppingCart className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium">View Orders</span>
          </Link>

          <Link
            href="/vendor/analytics"
            className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium">View Analytics</span>
          </Link>

          <Link
            href="/vendor/settings"
            className="flex flex-col items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
          >
            <Settings className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mb-2" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

