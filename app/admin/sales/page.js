"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Plus, FileText, Download } from "lucide-react"

// Mock sales data
const mockSales = [
  {
    id: "S1001",
    date: "2023-06-15",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
    },
    items: [
      { id: "1", name: "Premium Cotton T-Shirt", quantity: 2, price: 20.0 },
      { id: "3", name: "Denim Jeans", quantity: 1, price: 45.0 },
    ],
    subtotal: 85.0,
    tax: 8.5,
    discount: 0,
    total: 93.5,
    paymentMethod: "Credit Card",
    status: "completed",
    salesPerson: "Admin User",
  },
  {
    id: "S1002",
    date: "2023-06-16",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 (555) 987-6543",
    },
    items: [{ id: "2", name: "Wireless Bluetooth Headphones", quantity: 1, price: 108.0 }],
    subtotal: 108.0,
    tax: 10.8,
    discount: 10.0,
    total: 108.8,
    paymentMethod: "Cash",
    status: "completed",
    salesPerson: "Admin User",
  },
  {
    id: "S1003",
    date: "2023-06-17",
    customer: {
      name: "Robert Johnson",
      email: "robert@example.com",
      phone: "+1 (555) 456-7890",
    },
    items: [
      { id: "4", name: "Smartphone Case", quantity: 3, price: 15.0 },
      { id: "5", name: "Screen Protector", quantity: 3, price: 10.0 },
    ],
    subtotal: 75.0,
    tax: 7.5,
    discount: 5.0,
    total: 77.5,
    paymentMethod: "Mobile Payment",
    status: "completed",
    salesPerson: "Sales Staff 1",
  },
  {
    id: "S1004",
    date: "2023-06-18",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "+1 (555) 234-5678",
    },
    items: [
      { id: "1", name: "Premium Cotton T-Shirt", quantity: 1, price: 20.0 },
      { id: "6", name: "Smartwatch", quantity: 1, price: 199.0 },
    ],
    subtotal: 219.0,
    tax: 21.9,
    discount: 20.0,
    total: 220.9,
    paymentMethod: "Credit Card",
    status: "pending",
    salesPerson: "Sales Staff 2",
  },
  {
    id: "S1005",
    date: "2023-06-19",
    customer: {
      name: "Michael Wilson",
      email: "michael@example.com",
      phone: "+1 (555) 876-5432",
    },
    items: [
      { id: "7", name: "Laptop Backpack", quantity: 1, price: 65.0 },
      { id: "8", name: "Wireless Mouse", quantity: 1, price: 25.0 },
      { id: "9", name: "USB-C Cable", quantity: 2, price: 12.0 },
    ],
    subtotal: 114.0,
    tax: 11.4,
    discount: 0,
    total: 125.4,
    paymentMethod: "Bank Transfer",
    status: "completed",
    salesPerson: "Admin User",
  },
]

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setSales(mockSales)
      setLoading(false)
    }, 500)
  }, [])

  // Filter sales based on search term, status, and date
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || sale.status === statusFilter

    let matchesDate = true
    const saleDate = new Date(sale.date)
    const today = new Date()

    if (dateFilter === "today") {
      matchesDate = saleDate.toDateString() === today.toDateString()
    } else if (dateFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 7)
      matchesDate = saleDate >= weekAgo
    } else if (dateFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(today.getMonth() - 1)
      matchesDate = saleDate >= monthAgo
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Calculate totals
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalItems = filteredSales.reduce(
    (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Management</h1>
        <Link
          href="/admin/sales/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Sale
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Total Sales</h2>
          <p className="text-3xl font-bold">
            ${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredSales.length} transactions</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Total Items Sold</h2>
          <p className="text-3xl font-bold">{totalItems}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all sales</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Average Sale</h2>
          <p className="text-3xl font-bold">
            $
            {filteredSales.length > 0
              ? (totalSales / filteredSales.length).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Per transaction</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search sales..."
              className="w-full pl-10 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="flex space-x-4">
            <select
              className="border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <button className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
              <Download className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sale ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {sale.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{sale.customer.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{sale.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sale.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sale.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : sale.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                      }`}
                    >
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {sale.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/sales/${sale.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FileText className="h-5 w-5 inline" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No sales found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

