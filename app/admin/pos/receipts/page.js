"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, ArrowDownUp, FileText, Download, Printer, Eye, Calendar, User, X, Check, AlertTriangle, Trash2, Copy, Mail } from 'lucide-react'
import { useAuth } from "@/context/AuthContext"
import Link from 'next/link'
import Image from 'next/image'
import { useReactToPrint } from 'react-to-print'

export default function ReceiptsPage() {
  // Authentication
  const { getAuthToken } = useAuth()
  
  // State for receipts data
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Selected receipt for viewing
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const receiptRef = useRef(null)

  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${selectedReceipt?.id || 'POS'}`,
    // Add this onBeforeGetContent to ensure the content is ready
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        // Give React time to update the DOM
        setTimeout(() => {
          resolve();
        }, 200);
      });
    },
  })
  
  // Mock receipt data (replace with API call)
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoading(true)
        
        // In a real implementation, this would be an API call
        // const token = getAuthToken()
        // const response = await fetch(`/api/proxy/api/v1/pos/receipts?page=${currentPage}&limit=${itemsPerPage}...`, {
        //   headers: { 'Authorization': `Bearer ${token}` }
        // })
        // const data = await response.json()
        
        // Using mock data for now
        setTimeout(() => {
          const mockReceipts = Array.from({ length: 35 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            
            const statuses = ["completed", "refunded", "voided"]
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
              id: `R-${10000 + i}`,
              transactionId: `TX-${1000 + i}`,
              date: date.toISOString(),
              customer: i % 5 === 0 ? { id: `cust-${i}`, name: "Guest Customer", email: "" } : { 
                id: `cust-${i}`, 
                name: ["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis", "Michael Wilson"][Math.floor(Math.random() * 5)],
                email: ["john@example.com", "jane@example.com", "robert@example.com", "emily@example.com", "michael@example.com"][Math.floor(Math.random() * 5)]
              },
              items,
              payment: {
                method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                cardLast4: paymentMethods[Math.floor(Math.random() * paymentMethods.length)] === "card" ? Math.floor(1000 + Math.random() * 9000).toString() : null,
                subtotal,
                tax,
                discount,
                total
              },
              status,
              cashier: ["Sarah T.", "Mike J.", "Laura K.", "David M."][Math.floor(Math.random() * 4)],
              register: ["POS-01", "POS-02", "POS-03"][Math.floor(Math.random() * 3)],
              storeInfo: {
                name: "EcomStore",
                address: "123 Market Street, San Francisco, CA 94103",
                phone: "(555) 123-4567",
                email: "info@ecomstore.com",
                website: "www.ecomstore.com",
                taxId: "TAX-12345678"
              }
            }
          })
          
          setReceipts(mockReceipts)
          setTotalItems(mockReceipts.length)
          setLoading(false)
        }, 800)
        
      } catch (err) {
        console.error("Error fetching receipts:", err)
        setError("Failed to load receipt data. Please try again.")
        setLoading(false)
      }
    }
    
    fetchReceipts()
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
  
  // Filter and sort receipts
  const filteredReceipts = receipts
    .filter(receipt => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        receipt.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        receipt.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Status filter
      const matchesStatus = statusFilter === "all" || receipt.status === statusFilter
      
      // Date range filter
      let matchesDateRange = true
      if (dateRange.start && dateRange.end) {
        const receiptDate = new Date(receipt.date)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59, 999) // Include the entire end day
        
        matchesDateRange = receiptDate >= startDate && receiptDate <= endDate
      }
      
      return matchesSearch && matchesStatus && matchesDateRange
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
        // Sort by receipt ID number
        const aNum = parseInt(a.id.split('-')[1])
        const bNum = parseInt(b.id.split('-')[1])
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum
      }
      
      return 0
    })
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentReceipts = filteredReceipts.slice(indexOfFirstItem, indexOfLastItem)
  
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
  
  // Format date for receipt
  const formatReceiptDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'refunded': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      case 'voided': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }
  
  // Get payment method icon and label
  const getPaymentMethod = (method) => {
    switch (method) {
      case 'cash': return 'Cash'
      case 'card': return 'Credit/Debit Card'
      case 'gift-card': return 'Gift Card'
      case 'split': return 'Split Payment'
      default: return 'Unknown'
    }
  }
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4" />
      case 'refunded': return <ArrowDownUp className="w-4 h-4" />
      case 'voided': return <X className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  // Email receipt
  const emailReceipt = (receipt) => {
    if (!receipt.customer.email) {
      alert("This customer doesn't have an email address on file.")
      return
    }
    
    // Normally this would call your email API
    alert(`Receipt would be emailed to ${receipt.customer.email}`)
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">POS Receipts</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">View, print and manage all point-of-sale receipts</p>
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
                placeholder="Search by receipt ID, transaction ID or customer..."
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
          
          {/* Status Filter */}
          <div className="md:w-1/3">
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
            </select>
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
              onClick={() => alert("Batch print functionality would be implemented here")}
              className="text-sm flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Batch Print
            </button>
          </div>
        </div>
      </div>
      
      {/* Receipts Table */}
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
                    Receipt #
                    {sortField === "id" && (
                      <ArrowDownUp className={`w-3 h-3 ml-1 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center">
                    Transaction #
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
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
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
              ) : currentReceipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <FileText className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    No receipts found
                  </td>
                </tr>
              ) : (
                currentReceipts.map((receipt) => (
                  <tr 
                    key={receipt.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-white">{receipt.id}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{receipt.transactionId}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(receipt.date)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" /> 
                        <span className="text-sm text-gray-900 dark:text-white">{receipt.customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(receipt.payment.total)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                          {getStatusIcon(receipt.status)}
                          <span className="ml-1 capitalize">{receipt.status}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setSelectedReceipt(receipt)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Receipt"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReceipt(receipt);
                            // Don't call handlePrint directly here
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Print Receipt"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => emailReceipt(receipt)}
                          className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                          title="Email Receipt"
                        >
                          <Mail className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {!loading && !error && filteredReceipts.length > 0 && (
        <div className="flex justify-between items-center mt-4 px-2">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredReceipts.length)}
            </span>{" "}
            of <span className="font-medium">{filteredReceipts.length}</span> receipts
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
      
      {/* Receipt Viewer Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Receipt {selectedReceipt.id}
              </h2>
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Receipt Content */}
            <div className="p-6">
              {/* Receipt View for Printing */}
              <div className="receipt-container" ref={receiptRef}>
                <div className="p-6 bg-white text-black" style={{ fontFamily: 'Courier, monospace' }}>
                  {/* Store Header */}
                  <div className="text-center mb-4">
                    <div className="font-bold text-xl mb-1">{selectedReceipt.storeInfo.name}</div>
                    <div className="text-sm">{selectedReceipt.storeInfo.address}</div>
                    <div className="text-sm">Tel: {selectedReceipt.storeInfo.phone}</div>
                    <div className="text-sm">{selectedReceipt.storeInfo.website}</div>
                  </div>
                  
                  {/* Receipt Info */}
                  <div className="mb-4 text-sm">
                    <div>Receipt: {selectedReceipt.id}</div>
                    <div>Transaction: {selectedReceipt.transactionId}</div>
                    <div>Date: {formatReceiptDate(selectedReceipt.date)}</div>
                    <div>Cashier: {selectedReceipt.cashier}</div>
                    <div>Register: {selectedReceipt.register}</div>
                  </div>
                  
                  {/* Customer */}
                  <div className="mb-4 text-sm">
                    <div>Customer: {selectedReceipt.customer.name}</div>
                    {selectedReceipt.customer.email && <div>Email: {selectedReceipt.customer.email}</div>}
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-300 my-4"></div>
                  
                  {/* Items */}
                  <div className="mb-4">
                    <div className="font-bold mb-2">Items</div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="py-1 text-left">Qty</th>
                          <th className="py-1 text-left">Item</th>
                          <th className="py-1 text-right">Price</th>
                          <th className="py-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReceipt.items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            <td className="py-1">{item.quantity}</td>
                            <td className="py-1">{item.name}</td>
                            <td className="py-1 text-right">{formatCurrency(parseFloat(item.price))}</td>
                            <td className="py-1 text-right">{formatCurrency(parseFloat(item.price) * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Totals */}
                  <div className="mb-4 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedReceipt.payment.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%):</span>
                      <span>{formatCurrency(selectedReceipt.payment.tax)}</span>
                    </div>
                    {selectedReceipt.payment.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-{formatCurrency(selectedReceipt.payment.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold mt-1 pt-1 border-t border-gray-300">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedReceipt.payment.total)}</span>
                    </div>
                  </div>
                  
                  {/* Payment Method */}
                  <div className="mb-4 text-sm">
                    <div className="font-bold">Payment Method:</div>
                    <div>{getPaymentMethod(selectedReceipt.payment.method)}</div>
                    {selectedReceipt.payment.method === 'card' && selectedReceipt.payment.cardLast4 && (
                      <div>Card ending in {selectedReceipt.payment.cardLast4}</div>
                    )}
                    <div className="mt-1">Status: <span className="capitalize">{selectedReceipt.status}</span></div>
                  </div>
                  
                  {/* Footer */}
                  <div className="mt-6 text-center text-sm">
                    <div>Thank you for your purchase!</div>
                    {selectedReceipt.storeInfo.taxId && (
                      <div className="mt-2">Tax ID: {selectedReceipt.storeInfo.taxId}</div>
                    )}
                    <div className="mt-2">
                      {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-end border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <button
                  onClick={() => navigator.clipboard.writeText(`Receipt #${selectedReceipt.id} | Total: ${formatCurrency(selectedReceipt.payment.total)} | Date: ${formatDate(selectedReceipt.date)}`)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Info
                </button>
                
                <button
                  onClick={() => emailReceipt(selectedReceipt)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </button>
                
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700 flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}