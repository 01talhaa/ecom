"use client"

import { useState, useEffect } from 'react'
import { Search, Filter, ArrowDownUp, FileText, Download, Printer, Eye, Calendar, DollarSign, CreditCard, User, X, Check, AlertTriangle, TrendingUp } from 'lucide-react'
import { useAuth } from "@/context/AuthContext"
import Link from 'next/link'
import Image from 'next/image'

export default function TransactionsPage() {
  // Authentication
  const { getAuthToken } = useAuth()
  
  // State for transactions data
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showDetails, setShowDetails] = useState(null)
  
  // Mock transaction data (replace with API call)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true)
        
        // In a real implementation, this would be an API call
        // const token = getAuthToken()
        // const response = await fetch(`/api/proxy/api/v1/pos/transactions?page=${currentPage}&limit=${itemsPerPage}...`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // })
        // const data = await response.json()
        
        // Using mock data for now
        setTimeout(() => {
          const mockTransactions = Array.from({ length: 35 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            
            const statuses = ["completed", "refunded", "voided", "pending"]
            const paymentMethods = ["cash", "card", "gift-card", "split"]
            const status = statuses[Math.floor(Math.random() * statuses.length)]
            
            const items = Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
              id: `item-${i}-${j}`,
              name: ["Coffee Mug", "T-Shirt (Blue)", "Smartphone Case", "Wireless Earbuds", "Water Bottle"][Math.floor(Math.random() * 5)],
              price: (5 + Math.random() * 50).toFixed(2),
              quantity: Math.floor(Math.random() * 3) + 1
            }))
            
            const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)
            const tax = subtotal * 0.08
            const discount = i % 3 === 0 ? subtotal * 0.1 : 0
            const total = subtotal + tax - discount
            
            return {
              id: `tx-${1000 + i}`,
              date: date.toISOString(),
              customer: i % 5 === 0 ? { id: `cust-${i}`, name: "Guest Customer" } : { 
                id: `cust-${i}`, 
                name: ["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis", "Michael Wilson"][Math.floor(Math.random() * 5)] 
              },
              items,
              payment: {
                method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                subtotal,
                tax,
                discount,
                total
              },
              status,
              cashier: ["Sarah T.", "Mike J.", "Laura K.", "David M."][Math.floor(Math.random() * 4)],
              register: ["POS-01", "POS-02", "POS-03"][Math.floor(Math.random() * 3)]
            }
          })
          
          setTransactions(mockTransactions)
          setTotalItems(mockTransactions.length)
          setLoading(false)
        }, 800)
        
      } catch (err) {
        console.error("Error fetching transactions:", err)
        setError("Failed to load transaction data. Please try again.")
        setLoading(false)
      }
    }
    
    fetchTransactions()
  }, [currentPage, itemsPerPage])
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }
  
  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(tx => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tx.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Status filter
      const matchesStatus = statusFilter === "all" || tx.status === statusFilter
      
      // Payment method filter
      const matchesPayment = paymentMethodFilter === "all" || tx.payment.method === paymentMethodFilter
      
      // Date range filter
      let matchesDateRange = true
      if (dateRange.start && dateRange.end) {
        const txDate = new Date(tx.date)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999) // Include the entire end day
        
        matchesDateRange = txDate >= startDate && txDate <= endDate
      }
      
      return matchesSearch && matchesStatus && matchesPayment && matchesDateRange
    })
    .sort((a, b) => {
      // Handle sorting
      if (sortField === "date") {
        return sortDirection === "asc" 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      } else if (sortField === "total") {
        return sortDirection === "asc"
          ? a.payment.total - b.payment.total
          : b.payment.total - a.payment.total
      } else if (sortField === "id") {
        // Sort by transaction ID number
        const aNum = parseInt(a.id.split('-')[1])
        const bNum = parseInt(b.id.split('-')[1])
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum
      }
      
      return 0
    })
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'refunded': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      case 'voided': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }
  
  // Get payment method icon and label
  const getPaymentMethod = (method) => {
    switch (method) {
      case 'cash':
        return { icon: <DollarSign className="w-4 h-4" />, label: "Cash" }
      case 'card':
        return { icon: <CreditCard className="w-4 h-4" />, label: "Card" }
      case 'gift-card':
        return { icon: <FileText className="w-4 h-4" />, label: "Gift Card" }
      case 'split':
        return { icon: <TrendingUp className="w-4 h-4" />, label: "Split Payment" }
      default:
        return { icon: <DollarSign className="w-4 h-4" />, label: "Unknown" }
    }
  }
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4" />
      case 'refunded': return <ArrowDownUp className="w-4 h-4" />
      case 'voided': return <X className="w-4 h-4" />
      case 'pending': return <AlertTriangle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">POS Transactions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">View and manage all point-of-sale transactions</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Today's Sales</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$1,248.42</p>
          <div className="mt-2 text-xs text-green-600 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>12% from yesterday</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Transactions Today</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">9 cash / 15 card</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Sale</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$52.02</p>
          <div className="mt-2 text-xs text-red-600 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
            <span>3% from last week</span>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Refunds</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">$87.45 total</div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="md:w-1/3">
            <label htmlFor="search" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Search by ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Date Range */}
          <div className="md:w-1/3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <span className="self-center text-gray-500">to</span>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          {/* Status + Payment Filters */}
          <div className="md:w-1/3 flex gap-2">
            <div className="flex-1">
              <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="voided">Voided</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label htmlFor="paymentMethodFilter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment
              </label>
              <select
                id="paymentMethodFilter"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="gift-card">Gift Card</option>
                <option value="split">Split Payment</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Filter buttons */}
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <button
              onClick={() => {
                setSearchTerm("")
                setDateRange({ start: "", end: "" })
                setStatusFilter("all")
                setPaymentMethodFilter("all")
              }}
              className="text-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => alert("Export functionality would be implemented here")}
              className="text-sm flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <button
              onClick={() => alert("Print functionality would be implemented here")}
              className="text-sm flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    Transaction ID
                    {sortField === "id" && (
                      <ArrowDownUp className={`w-3 h-3 ml-1 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Date & Time
                    {sortField === "date" && (
                      <ArrowDownUp className={`w-3 h-3 ml-1 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment Method
                </th>
                <th 
                  scope="col" 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("total")}
                >
                  <div className="flex items-center justify-end">
                    Total
                    {sortField === "total" && (
                      <ArrowDownUp className={`w-3 h-3 ml-1 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-16"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-12"></div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-red-500">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    {error}
                  </td>
                </tr>
              ) : currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <ShoppingCart className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    No transactions found
                  </td>
                </tr>
              ) : (
                currentTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">{transaction.id}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(transaction.date)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" /> 
                        <span className="text-sm text-gray-900 dark:text-white">{transaction.customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPaymentMethod(transaction.payment.method).icon}
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {getPaymentMethod(transaction.payment.method).label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(transaction.payment.total)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => setShowDetails(transaction.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {!loading && !error && filteredTransactions.length > 0 && (
        <div className="flex justify-between items-center mt-4 px-2">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredTransactions.length)}
            </span>{" "}
            of <span className="font-medium">{filteredTransactions.length}</span> transactions
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to show the right page numbers
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Transaction Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Transaction Details
              </h2>
              <button 
                onClick={() => setShowDetails(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Transaction found */}
              {(() => {
                const transaction = transactions.find(t => t.id === showDetails);
                if (!transaction) return null;
                
                return (
                  <>
                    {/* Transaction Header */}
                    <div className="flex flex-col lg:flex-row lg:justify-between mb-6 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {transaction.id}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </p>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span className="font-medium">Cashier:</span> {transaction.cashier}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span className="font-medium">Register:</span> {transaction.register}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Payment:</span> {getPaymentMethod(transaction.payment.method).label}
                        </div>
                      </div>
                    </div>
                    
                    {/* Customer Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Information</h4>
                      <div className="flex items-start">
                        <User className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.customer.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Customer ID: {transaction.customer.id}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Items Table */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items Purchased</h4>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Item
                              </th>
                              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Price
                              </th>
                              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {transaction.items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-center">
                                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.quantity}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {formatCurrency(parseFloat(item.price))}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(parseFloat(item.price) * item.quantity)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Payment Summary */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Summary</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(transaction.payment.subtotal)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Tax (8%):</span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {formatCurrency(transaction.payment.tax)}
                          </span>
                        </div>
                        
                        {transaction.payment.discount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Discount:</span>
                            <span className="text-sm text-red-600 dark:text-red-400">
                              -{formatCurrency(transaction.payment.discount)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total:</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(transaction.payment.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <button
                        onClick={() => alert("Print receipt functionality would go here")}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print Receipt
                      </button>
                      
                      {transaction.status === 'completed' && (
                        <button
                          onClick={() => alert("Refund functionality would go here")}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                        >
                          <ArrowDownUp className="w-4 h-4 mr-2" />
                          Process Refund
                        </button>
                      )}
                      
                      <button
                        onClick={() => alert("Email receipt functionality would go here")}
                        className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Email Receipt
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}