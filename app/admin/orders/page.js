"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, ArrowUpDown, Eye, Printer, Download, Edit, Trash2, Plus, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

// Helper function to safely parse JSON
const safelyParseJson = async (response) => {
  try {
    // First check if response is ok
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Get the response text first
    const text = await response.text();
    
    // If empty response, return a default structure
    if (!text || text.trim() === '') {
      console.warn('Empty response received from API');
      return { success: false, message: 'Empty response received from server' };
    }
    
    // Try to parse the text as JSON
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError, 'Raw response:', text);
      return { success: false, message: 'Invalid JSON response from server' };
    }
  } catch (err) {
    console.error('Response error:', err);
    return { success: false, message: err.message };
  }
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [filterOptions, setFilterOptions] = useState({
    status: "",
    dateRange: "all",
    paymentMethod: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Add state for order creation/editing
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    customerId: "",
    shippingAddresId: 0,
    billingAddressId: 0,
    paymentMethod: "",
    shippingMethod: "",
    deliveryDate: "",
    deliveryTime: "",
    notes: "",
    couponCode: "",
    items: [
      {
        productId: 0,
        variantId: 0,
        quantity: 1
      }
    ]
  })
  
  const { getAuthToken } = useAuth()

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
    fetchProducts()
  }, [currentPage])

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const response = await fetch(`/api/proxy/api/v1/orders?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        setOrders(data.data.result || [])
        setTotalItems(data.data.meta?.total || 0)
        setTotalPages(data.data.meta?.totalPage || 1)
      } else {
        throw new Error(data.message || "Failed to fetch orders")
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError(err.message || "An error occurred while fetching orders")
      // If API fails, we'll still show UI with empty data
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch customers for the dropdown
  const fetchCustomers = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const response = await fetch(`/api/proxy/api/v1/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        setCustomers(data.data.result || [])
      } else {
        console.error("Failed to fetch customers:", data.message)
      }
    } catch (err) {
      console.error("Error fetching customers:", err)
    }
  }

  // Fetch products for the dropdown using a similar approach as in the products page
  const fetchProducts = async () => {
    try {
      setLoading(true)

      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      // Use the same API endpoint as in the products page, but we'll get all products for the dropdown
      const response = await fetch(`/api/proxy/api/v1/product?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Process the response similar to the products page
        const processedProducts = processProductData(data, []);
        setProducts(processedProducts || [])
      } else {
        if (data.message === "No Data Available") {
          setProducts([])
        } else {
          throw new Error(data.message || "Failed to fetch products")
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      // Don't set error state to avoid confusing the user about the main orders functionality
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // Add the helper function to process product data
  const processProductData = (apiData, categoriesData) => {
    if (!apiData?.data?.result || !Array.isArray(apiData.data.result)) {
      console.log("No result array found in API data:", apiData);
      return [];
    }
    
    // Create a category map for faster lookups
    const categoryMap = {};
    if (Array.isArray(categoriesData)) {
      categoriesData.forEach(category => {
        categoryMap[category.categoryId] = category.categoryName;
      });
    }
    
    return apiData.data.result.map(product => {
      return {
        ...product,
        // Get actual category name from our fetched categories if needed
        categoryName: product.categoryName || categoryMap[product.categoryId] || `Category ${product.categoryId}`
      };
    });
  };

  // Fetch single order details
  const fetchOrderDetails = async (orderId) => {
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const response = await fetch(`/api/proxy/api/v1/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        setCurrentOrder(data.data)
        // Populate form with order data
        setFormData({
          customerId: data.data.customerId,
          shippingAddresId: data.data.shippingAddresId || 0,
          billingAddressId: data.data.billingAddressId || 0,
          paymentMethod: data.data.paymentMethod || "",
          shippingMethod: data.data.shippingMethod || "",
          deliveryDate: data.data.deliveryDate ? new Date(data.data.deliveryDate).toISOString().split('T')[0] : "",
          deliveryTime: data.data.deliveryTime || "",
          notes: data.data.notes || "",
          couponCode: data.data.couponCode || "",
          items: data.data.items && data.data.items.length > 0 
            ? data.data.items.map(item => ({
                productId: item.productId,
                variantId: item.variantId || 0,
                quantity: item.quantity
              }))
            : [{
                productId: 0,
                variantId: 0,
                quantity: 1
              }]
        })
        return data.data
      } else {
        throw new Error(data.message || "Failed to fetch order details")
      }
    } catch (err) {
      console.error("Error fetching order details:", err)
      setError(err.message || "An error occurred while fetching order details")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Create new order
  const handleAddOrder = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      // Clean and validate form data
      const orderData = {
        ...formData,
        customerId: parseInt(formData.customerId),
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : new Date().toISOString(),
        items: formData.items.filter(item => item.productId > 0).map(item => ({
          ...item,
          productId: parseInt(item.productId),
          variantId: parseInt(item.variantId) || 0,
          quantity: parseFloat(item.quantity) || 1
        }))
      }

      // Validate required fields
      if (!orderData.customerId || orderData.items.length === 0) {
        throw new Error("Customer and at least one product are required")
      }

      const response = await fetch("/api/proxy/api/v1/orders", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        // Reset form and close modal
        setFormData({
          customerId: "",
          shippingAddresId: 0,
          billingAddressId: 0,
          paymentMethod: "",
          shippingMethod: "",
          deliveryDate: "",
          deliveryTime: "",
          notes: "",
          couponCode: "",
          items: [
            {
              productId: 0,
              variantId: 0,
              quantity: 1
            }
          ]
        })
        setShowOrderModal(false)
        
        // Refresh orders list
        fetchOrders()
        
        alert("Order added successfully!")
      } else {
        throw new Error(data.message || "Failed to add order")
      }
    } catch (err) {
      console.error("Error adding order:", err)
      setError(err.message || "An error occurred while adding the order")
    } finally {
      setLoading(false)
    }
  }

  // Update existing order
  const handleUpdateOrder = async (e) => {
    e.preventDefault()
    
    if (!currentOrder?.orderId) return;
    
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      // Clean and validate form data
      const orderData = {
        ...formData,
        orderId: currentOrder.orderId,
        customerId: parseInt(formData.customerId),
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : new Date().toISOString(),
        items: formData.items.filter(item => item.productId > 0).map(item => ({
          ...item,
          productId: parseInt(item.productId),
          variantId: parseInt(item.variantId) || 0,
          quantity: parseFloat(item.quantity) || 1
        }))
      }

      // Validate required fields
      if (!orderData.customerId || orderData.items.length === 0) {
        throw new Error("Customer and at least one product are required")
      }

      const response = await fetch(`/api/proxy/api/v1/orders/${currentOrder.orderId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        // Reset form and close modal
        setFormData({
          customerId: "",
          shippingAddresId: 0,
          billingAddressId: 0,
          paymentMethod: "",
          shippingMethod: "",
          deliveryDate: "",
          deliveryTime: "",
          notes: "",
          couponCode: "",
          items: [
            {
              productId: 0,
              variantId: 0,
              quantity: 1
            }
          ]
        })
        setCurrentOrder(null)
        setShowOrderModal(false)
        setIsEditing(false)
        
        // Refresh orders list
        fetchOrders()
        
        alert("Order updated successfully!")
      } else {
        throw new Error(data.message || "Failed to update order")
      }
    } catch (err) {
      console.error("Error updating order:", err)
      setError(err.message || "An error occurred while updating the order")
    } finally {
      setLoading(false)
    }
  }

  // Delete order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        if (!token) {
          throw new Error("Authentication token is missing")
        }

        const response = await fetch(`/api/proxy/api/v1/orders/${orderId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await safelyParseJson(response)
        
        if (data.success) {
          // Refresh orders list
          fetchOrders()
          
          alert("Order deleted successfully!")
        } else {
          throw new Error(data.message || "Failed to delete order")
        }
      } catch (err) {
        console.error("Error deleting order:", err)
        setError(err.message || "An error occurred while deleting the order")
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle edit order button click
  const handleEditOrder = async (orderId) => {
    const orderData = await fetchOrderDetails(orderId)
    if (orderData) {
      setIsEditing(true)
      setShowOrderModal(true)
    }
  }

  // Form input change handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle item changes in the form
  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[index] = {
        ...newItems[index],
        [field]: value
      }
      return {
        ...prev,
        items: newItems
      }
    })
  }

  // Add new item row
  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: 0,
          variantId: 0,
          quantity: 1
        }
      ]
    }))
  }

  // Remove item row
  const removeItemRow = (index) => {
    if (formData.items.length <= 1) return

    setFormData(prev => {
      const newItems = [...prev.items]
      newItems.splice(index, 1)
      return {
        ...prev,
        items: newItems
      }
    })
  }

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle sorting
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
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

  // Get local filtered data (client-side filtering after fetching)
  const filteredOrders = orders.filter(order => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      (order.orderId?.toString().includes(searchTerm) ||
       (order.customer?.name && order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (order.customer?.email && order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())))
    
    // Status filter
    const matchesStatus = filterOptions.status === "" || 
      order.status === filterOptions.status
    
    // Payment method filter
    const matchesPaymentMethod = filterOptions.paymentMethod === "" || 
      order.paymentMethod === filterOptions.paymentMethod
    
    // Date range filter
    let matchesDateRange = true
    const orderDate = order.createdAt ? new Date(order.createdAt) : null
    
    if (orderDate && filterOptions.dateRange !== "all") {
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
    }
    
    return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateRange
  })

  // Get sorted orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === "createdAt" || sortField === "deliveryDate") {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  // Extract unique payment methods for filter dropdown
  const paymentMethods = [...new Set(orders.filter(order => order.paymentMethod).map(order => order.paymentMethod))]

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (err) {
      return dateString
    }
  }

  // Get customer name from customerId
  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.customerId === customerId)
    return customer ? customer.customerName : `Customer #${customerId}`
  }

  // Get product name from productId
  const getProductName = (productId) => {
    const product = products.find(p => p.productId === productId)
    return product ? product.productName : `Product #${productId}`
  }

const getStatusBadgeClass = (status) => {
  // Make sure status is a string and not null/undefined
  if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  
  // Convert to string if it's not already, then lowercase
  const statusStr = String(status).toLowerCase();
  
  switch (statusStr) {
    case "delivered":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
};

  if (loading && orders.length === 0) {
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
          <button
            onClick={() => {
              setIsEditing(false)
              setCurrentOrder(null)
              setFormData({
                customerId: "",
                shippingAddresId: 0,
                billingAddressId: 0,
                paymentMethod: "",
                shippingMethod: "",
                deliveryDate: "",
                deliveryTime: "",
                notes: "",
                couponCode: "",
                items: [
                  {
                    productId: 0,
                    variantId: 0,
                    quantity: 1
                  }
                ]
              })
              setShowOrderModal(true)
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Order
          </button>
          <button className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div>
            <p>{error}</p>
            <button 
              onClick={fetchOrders}
              className="text-sm underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

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
          Showing {filteredOrders.length} of {totalItems} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("orderId")}
              >
                <div className="flex items-center">
                  Order ID
                  <ArrowUpDown className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdAt")}
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
            {filteredOrders.length === 0 ? (
              <tr key="no-orders-row">
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No orders found. 
                  {searchTerm || filterOptions.status || filterOptions.paymentMethod || filterOptions.dateRange !== "all" 
                    ? " Try clearing your filters." 
                    : ""}
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                // Ensure each order has a unique key - use orderId if available, or fallback to index
                <tr key={order.orderId || `order-${order.id || Math.random()}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{order.orderId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {order.createdAt ? (
                      <>
                        {new Date(order.createdAt).toLocaleDateString()}
                        <span className="text-xs block">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </>
                    ) : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div>{getCustomerName(order.customerId)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">ID: {order.customerId}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${(order.total || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {order.paymentMethod || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/orders/${order.orderId}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Order"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => handleEditOrder(order.orderId)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Edit Order"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Order"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        title="Print Order"
                      >
                        <Printer className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1 || loading
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Previous
            </button>
            {totalPages <= 5 ? (
              [...Array(totalPages)].map((_, i) => (
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
              ))
            ) : (
              <>
                {currentPage > 2 && (
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    1
                  </button>
                )}
                {currentPage > 3 && <span className="px-1 py-1">...</span>}
                {currentPage > 1 && (
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {currentPage - 1}
                  </button>
                )}
                <button
                  className="px-3 py-1 rounded-md bg-blue-600 text-white"
                >
                  {currentPage}
                </button>
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {currentPage + 1}
                  </button>
                )}
                {currentPage < totalPages - 2 && <span className="px-1 py-1">...</span>}
                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {totalPages}
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages || loading
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {isEditing ? 'Edit Order' : 'Create New Order'}
              </h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={isEditing ? handleUpdateOrder : handleAddOrder}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                      <select
                        name="customerId"
                        value={formData.customerId}
                        onChange={handleFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select a customer</option>
                        {customers.map(customer => (
                          <option key={customer.customerId} value={customer.customerId}>
                            {customer.customerName || `Customer #${customer.customerId}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select payment method</option>
                        <option value="Cash">Cash</option>
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="SSLCommerz">SSLCommerz</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Method</label>
                      <select
                        name="shippingMethod"
                        value={formData.shippingMethod}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select shipping method</option>
                        <option value="Standard">Standard Shipping</option>
                        <option value="Express">Express Shipping</option>
                        <option value="Pickup">Pickup</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Date</label>
                        <input
                          type="date"
                          name="deliveryDate"
                          value={formData.deliveryDate}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Time</label>
                        <input
                          type="time"
                          name="deliveryTime"
                          value={formData.deliveryTime}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coupon Code</label>
                      <input
                        type="text"
                        name="couponCode"
                        value={formData.couponCode}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter coupon code (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleFormChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Additional notes"
                      ></textarea>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Items</label>
                    <div className="space-y-3">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex flex-col space-y-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Item {index + 1}</span>
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(index)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Product</label>
                            <select
                              value={item.productId}
                              onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                            >
                              <option value="">Select a product</option>
                              {products.map(product => (
                                <option key={product.productId} value={product.productId}>
                                  {product.productName || `Product #${product.productId}`} 
                                  {product.price ? ` - $${product.price}` : ''}
                                  {product.stock ? ` (${product.stock} in stock)` : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Variant ID</label>
                              <input
                                type="number"
                                value={item.variantId}
                                onChange={(e) => handleItemChange(index, 'variantId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                step="0.1"
                                min="0.1"
                                required
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addItemRow}
                        className="mt-2 w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                      >
                        + Add Another Item
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOrderModal(false)
                      setCurrentOrder(null)
                      setIsEditing(false)
                    }}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditing ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      isEditing ? 'Update Order' : 'Create Order'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}