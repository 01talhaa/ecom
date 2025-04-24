"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, ArrowUpDown, Eye, Printer, Download } from "lucide-react"

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [filterOptions, setFilterOptions] = useState({
    status: "",
    dateRange: "all",
    paymentMethod: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      // In a real app, you would fetch orders from your API
      // For demo purposes, we'll create mock data
      const mockOrders = [
        {
          id: "ORD-1001",
          date: "2023-05-15T10:30:00Z",
          customer: {
            id: "CUST-101",
            name: "John Doe",
            email: "john@example.com",
          },
          status: "Delivered",
          total: 145.98,
          paymentMethod: "bKash",
          items: [
            {
              id: "1",
              name: "Premium Cotton T-Shirt",
              quantity: 2,
              price: 20.0,
              image: "/placeholder.svg",
            },
            {
              id: "2",
              name: "Wireless Bluetooth Headphones",
              quantity: 1,
              price: 108.0,
              image: "/placeholder.svg",
            },
          ],
        },
        {
          id: "ORD-1002",
          date: "2023-06-22T14:45:00Z",
          customer: {
            id: "CUST-102",
            name: "Jane Smith",
            email: "jane@example.com",
          },
          status: "Processing",
          total: 85.5,
          paymentMethod: "Nagad",
          items: [
            {
              id: "1",
              name: "Premium Cotton T-Shirt",
              quantity: 1,
              price: 20.0,
              image: "/placeholder.svg",
            },
            {
              id: "3",
              name: "Leather Wallet",
              quantity: 1,
              price: 65.5,
              image: "/placeholder.svg",
            },
          ],
        },
        {
          id: "ORD-1003",
          date: "2023-06-25T09:15:00Z",
          customer: {
            id: "CUST-103",
            name: "Robert Johnson",
            email: "robert@example.com",
          },
          status: "Shipped",
          total: 210.0,
          paymentMethod: "SSLCommerz",
          items: [
            {
              id: "2",
              name: "Wireless Bluetooth Headphones",
              quantity: 2,
              price: 108.0,
              image: "/placeholder.svg",
            },
          ],
        },
        {
          id: "ORD-1004",
          date: "2023-06-28T16:20:00Z",
          customer: {
            id: "CUST-104",
            name: "Emily Davis",
            email: "emily@example.com",
          },
          status: "Cancelled",
          total: 65.0,
          paymentMethod: "Cash on Delivery",
          items: [
            {
              id: "4",
              name: "Smartphone Case",
              quantity: 1,
              price: 15.0,
              image: "/placeholder.svg",
            },
            {
              id: "5",
              name: "USB Cable",
              quantity: 2,
              price: 25.0,
              image: "/placeholder.svg",
            },
          ],
        },
        {
          id: "ORD-1005",
          date: "2023-07-01T11:10:00Z",
          customer: {
            id: "CUST-105",
            name: "Michael Wilson",
            email: "michael@example.com",
          },
          status: "Pending",
          total: 320.75,
          paymentMethod: "bKash",
          items: [
            {
              id: "6",
              name: "Smart Watch",
              quantity: 1,
              price: 250.0,
              image: "/placeholder.svg",
            },
            {
              id: "7",
              name: "Watch Strap",
              quantity: 2,
              price: 35.0,
              image: "/placeholder.svg",
            },
          ],
        },
        {
          id: "ORD-1006",
          date: "2023-07-05T13:45:00Z",
          customer: {
            id: "CUST-106",
            name: "Sarah Brown",
            email: "sarah@example.com",
          },
          status: "Processing",
          total: 175.25,
          paymentMethod: "Nagad",
          items: [
            {
              id: "8",
              name: "Bluetooth Speaker",
              quantity: 1,
              price: 120.0,
              image: "/placeholder.svg",
            },
            {
              id: "9",
              name: "Phone Charger",
              quantity: 1,
              price: 55.25,
              image: "/placeholder.svg",
            },
          ],
        },
        {
          id: "ORD-1007",
          date: "2023-07-10T09:30:00Z",
          customer: {
            id: "CUST-107",
            name: "David Miller",
            email: "david@example.com",
          },
          status: "Delivered",
          total: 430.0,
          paymentMethod: "SSLCommerz",
          items: [
            {
              id: "10",
              name: "Laptop Bag",
              quantity: 1,
              price: 80.0,
              image: "/placeholder.svg",
            },
            {
              id: "11",
              name: "Wireless Mouse",
              quantity: 1,
              price: 45.0,
              image: "/placeholder.svg",
            },
            {
              id: "12",
              name: "External Hard Drive",
              quantity: 1,
              price: 305.0,
              image: "/placeholder.svg",
            },
          ],
        },
      ]

      setOrders(mockOrders)
      setLoading(false)
    }
    fetchOrders()
  }, [])

  // Get unique payment methods for filters
  const paymentMethods = [...new Set(orders.map((order) => order.paymentMethod))]

  // Handle search and filters
  const filteredOrders = orders.filter((order) => {
    // Search term filter
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = filterOptions.status ? order.status === filterOptions.status : true

    // Payment method filter
    const matchesPaymentMethod = filterOptions.paymentMethod
      ? order.paymentMethod === filterOptions.paymentMethod
      : true

    // Date range filter
    let matchesDateRange = true
    const orderDate = new Date(order.date)
    const now = new Date()

    if (filterOptions.dateRange === "today") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      matchesDateRange = orderDate >= today
    } else if (filterOptions.dateRange === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      matchesDateRange = orderDate >= weekAgo
    } else if (filterOptions.dateRange === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      matchesDateRange = orderDate >= monthAgo
    }

    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange
  })

  // Handle sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    } else if (sortField === "total") {
      return sortDirection === "asc" ? a.total - b.total : b.total - a.total
    } else {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else {
        return 0
      }
    }
  })

  // Handle pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage)

  // Handle sort change
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilterOptions((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      status: "",
      dateRange: "all",
      paymentMethod: "",
    })
    setSearchTerm("")
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">Orders</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Status</label>
              <select
                name="status"
                value={filterOptions.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
              <select
                name="dateRange"
                value={filterOptions.dateRange}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select
                name="paymentMethod"
                value={filterOptions.paymentMethod}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Payment Methods</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  Order ID
                  <ArrowUpDown className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  <ArrowUpDown className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("total")}
              >
                <div className="flex items-center">
                  Total
                  <ArrowUpDown className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentItems.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.date).toLocaleDateString()}
                  <span className="text-xs block">
                    {new Date(order.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  <div>{order.customer.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{order.customer.email}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{order.paymentMethod}</td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end space-x-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">
              {indexOfLastItem > filteredOrders.length ? filteredOrders.length : indexOfLastItem}
            </span>{" "}
            of <span className="font-medium">{filteredOrders.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

