"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Plus, FileText, Download } from "lucide-react"

// Mock sales returns data
const mockReturns = [
  {
    id: "R1001",
    saleId: "S1001",
    date: "2023-06-20",
    customer: {
      name: "John Doe",
      email: "john@example.com",
    },
    items: [{ id: "1", name: "Premium Cotton T-Shirt", quantity: 1, price: 20.0, reason: "Wrong size" }],
    total: 20.0,
    status: "completed",
    refundMethod: "Credit Card",
    processedBy: "Admin User",
  },
  {
    id: "R1002",
    saleId: "S1003",
    date: "2023-06-22",
    customer: {
      name: "Robert Johnson",
      email: "robert@example.com",
    },
    items: [{ id: "4", name: "Smartphone Case", quantity: 1, price: 15.0, reason: "Defective" }],
    total: 15.0,
    status: "pending",
    refundMethod: "Store Credit",
    processedBy: "Sales Staff 1",
  },
  {
    id: "R1003",
    saleId: "S1004",
    date: "2023-06-25",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
    },
    items: [{ id: "6", name: "Smartwatch", quantity: 1, price: 199.0, reason: "Not as described" }],
    total: 199.0,
    status: "completed",
    refundMethod: "Credit Card",
    processedBy: "Sales Staff 2",
  },
]

export default function SalesReturnsPage() {
  const [returns, setReturns] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setReturns(mockReturns)
      setLoading(false)
    }, 500)
  }, [])

  // Filter returns based on search term, status, and date
  const filteredReturns = returns.filter((returnItem) => {
    const matchesSearch =
      returnItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.saleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || returnItem.status === statusFilter

    let matchesDate = true
    const returnDate = new Date(returnItem.date)
    const today = new Date()

    if (dateFilter === "today") {
      matchesDate = returnDate.toDateString() === today.toDateString()
    } else if (dateFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 7)
      matchesDate = returnDate >= weekAgo
    } else if (dateFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(today.getMonth() - 1)
      matchesDate = returnDate >= monthAgo
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Calculate totals
  const totalRefunds = filteredReturns.reduce((sum, returnItem) => sum + returnItem.total, 0)
  const totalItems = filteredReturns.reduce(
    (sum, returnItem) => sum + returnItem.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
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
        <h1 className="text-2xl font-bold">Sales Returns</h1>
        <Link
          href="/admin/sales/returns/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Process Return
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Total Returns</h2>
          <p className="text-3xl font-bold">
            ${totalRefunds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredReturns.length} returns</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Items Returned</h2>
          <p className="text-3xl font-bold">{totalItems}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Across all returns</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-2">Average Return</h2>
          <p className="text-3xl font-bold">
            $
            {filteredReturns.length > 0
              ? (totalRefunds / filteredReturns.length).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Per return</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search returns..."
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
              <option value="rejected">Rejected</option>
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
                  Return ID
                </th>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredReturns.map((returnItem) => (
                <tr key={returnItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {returnItem.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {returnItem.saleId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(returnItem.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{returnItem.customer.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{returnItem.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {returnItem.items.reduce((sum, item) => sum + item.quantity, 0)} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${returnItem.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        returnItem.status === "completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : returnItem.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                      }`}
                    >
                      {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/sales/returns/${returnItem.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FileText className="h-5 w-5 inline" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No returns found
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

