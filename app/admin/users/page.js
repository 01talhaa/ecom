"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ArrowUpDown, UserPlus, Edit, Trash2, UserX, UserCheck, AlertCircle } from "lucide-react"
import Image from "next/image"
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

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState("customerName")
  const [sortDirection, setSortDirection] = useState("asc")
  const [filterOptions, setFilterOptions] = useState({
    customerType: "",
    status: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState(null)
  const [formData, setFormData] = useState({
    customerName: "",
    customerAddress: "",
    mobile: "",
    customerType: "New",
    email: "",
    status: true,
  })
  const { getAuthToken } = useAuth()

  // Fetch customers on page load and when pagination/filters change
  useEffect(() => {
    fetchCustomers()
  }, [currentPage])

  const fetchCustomers = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      // Construct the API URL with pagination parameters
      let apiUrl = `/api/proxy/api/v1/customers?page=${currentPage}&limit=${itemsPerPage}`

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        console.log("Customers data:", data)
        setCustomers(data.data.result)
        setTotalItems(data.data.meta.total)
        setTotalPages(data.data.meta.totalPage)
      } else {
        throw new Error(data.message || "Failed to fetch customers")
      }
    } catch (err) {
      console.error("Error fetching customers:", err)
      setError(err.message || "An error occurred while fetching customers")
    } finally {
      setLoading(false)
    }
  }

  // Fetch single customer details
  const fetchCustomerDetails = async (customerId) => {
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const response = await fetch(`/api/proxy/api/v1/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        setCurrentCustomer(data.data)
        // Populate form data with customer details
        setFormData({
          customerName: data.data.customerName || "",
          customerAddress: data.data.customerAddress || "",
          mobile: data.data.mobile || "",
          customerType: data.data.customerType || "New",
          email: data.data.email || "",
          status: data.data.status
        })
        return data.data
      } else {
        throw new Error(data.message || "Failed to fetch customer details")
      }
    } catch (err) {
      console.error("Error fetching customer details:", err)
      setError(err.message || "An error occurred while fetching customer details")
      return null
    } finally {
      setLoading(false)
    }
  }

  // Handle add customer form submission
  const handleAddCustomer = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      // Create customer object for API
      const customerData = {
        customerId: 0, // New customer
        customerName: formData.customerName,
        customerAddress: formData.customerAddress,
        mobile: formData.mobile,
        customerType: formData.customerType,
        email: formData.email,
        loginId: 0, // This will be set by the API
        status: formData.status,
        createdBy: 0, // This will be set by the API
        createdTime: new Date().toISOString()
      }

      const response = await fetch("/api/proxy/api/v1/customers", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        // Reset form and close modal
        setFormData({
          customerName: "",
          customerAddress: "",
          mobile: "",
          customerType: "New",
          email: "",
          status: true
        })
        setShowAddCustomerModal(false)
        
        // Refresh customers list
        fetchCustomers()
        
        alert("Customer added successfully!")
      } else {
        throw new Error(data.message || "Failed to add customer")
      }
    } catch (err) {
      console.error("Error adding customer:", err)
      setError(err.message || "An error occurred while adding the customer")
    } finally {
      setLoading(false)
    }
  }

  // Handle edit customer form submission
  const handleUpdateCustomer = async (e) => {
    e.preventDefault()
    
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      // Create customer object for API
      const customerData = {
        customerId: currentCustomer.customerId,
        customerName: formData.customerName,
        customerAddress: formData.customerAddress,
        mobile: formData.mobile,
        customerType: formData.customerType,
        email: formData.email,
        loginId: currentCustomer.loginId,
        status: formData.status,
        createdBy: currentCustomer.createdBy,
        createdTime: currentCustomer.createdTime
      }

      const response = await fetch(`/api/proxy/api/v1/customers/${currentCustomer.customerId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        // Reset form and close modal
        setFormData({
          customerName: "",
          customerAddress: "",
          mobile: "",
          customerType: "New",
          email: "",
          status: true
        })
        setCurrentCustomer(null)
        setShowEditCustomerModal(false)
        
        // Refresh customers list
        fetchCustomers()
        
        alert("Customer updated successfully!")
      } else {
        throw new Error(data.message || "Failed to update customer")
      }
    } catch (err) {
      console.error("Error updating customer:", err)
      setError(err.message || "An error occurred while updating the customer")
    } finally {
      setLoading(false)
    }
  }

  // Handle delete customer
  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setLoading(true)
      setError(null)

      try {
        const token = getAuthToken()
        if (!token) {
          throw new Error("Authentication token is missing")
        }

        const response = await fetch(`/api/proxy/api/v1/customers/${customerId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await safelyParseJson(response)
        
        if (data.success) {
          // Refresh customers list
          fetchCustomers()
          
          alert("Customer deleted successfully!")
        } else {
          throw new Error(data.message || "Failed to delete customer")
        }
      } catch (err) {
        console.error("Error deleting customer:", err)
        setError(err.message || "An error occurred while deleting the customer")
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle toggle customer status
  const handleToggleCustomerStatus = async (customerId, currentStatus) => {
    setLoading(true)
    setError(null)

    try {
      // First fetch customer details
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const response = await fetch(`/api/proxy/api/v1/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await safelyParseJson(response)
      
      if (data.success) {
        const customer = data.data
        
        // Update status
        const updatedCustomer = {
          ...customer,
          status: !currentStatus
        }
        
        // Send update request
        const updateResponse = await fetch(`/api/proxy/api/v1/customers/${customerId}`, {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedCustomer)
        })
        
        const updateData = await safelyParseJson(updateResponse)
        
        if (updateData.success) {
          // Refresh customers list
          fetchCustomers()
          
          alert(`Customer ${currentStatus ? 'deactivated' : 'activated'} successfully!`)
        } else {
          throw new Error(updateData.message || "Failed to update customer status")
        }
      } else {
        throw new Error(data.message || "Failed to fetch customer details")
      }
    } catch (err) {
      console.error("Error toggling customer status:", err)
      setError(err.message || "An error occurred while updating customer status")
    } finally {
      setLoading(false)
    }
  }

  // Handle edit customer
  const handleEditCustomer = async (customerId) => {
    const customerData = await fetchCustomerDetails(customerId)
    if (customerData) {
      setShowEditCustomerModal(true)
    }
  }

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      customerType: "",
      status: ""
    })
    setSearchTerm("")
  }

  // Get local filtered data (filtering is done on the server)
  const filteredCustomers = customers.filter(customer => {
    // Search term filter (client-side)
    const matchesSearch = searchTerm === "" || 
      (customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile?.includes(searchTerm))

    // Customer type filter (client-side)
    const matchesType = filterOptions.customerType === "" || 
      customer.customerType === filterOptions.customerType

    // Status filter (client-side)
    const matchesStatus = filterOptions.status === "" || 
      (filterOptions.status === "active" && customer.status) ||
      (filterOptions.status === "inactive" && !customer.status)

    return matchesSearch && matchesType && matchesStatus
  })

  // Extract unique customer types for filter dropdown
  const uniqueCustomerTypes = [...new Set(customers.map(c => c.customerType))].filter(Boolean)

  // Format date string to local format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    } catch (err) {
      return dateString
    }
  }

  if (loading && customers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">Customers</h1>
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
              setShowAddCustomerModal(true)
              setFormData({
                customerName: "",
                customerAddress: "",
                mobile: "",
                customerType: "New",
                email: "",
                status: true
              })
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div>
            <p>{error}</p>
            <button 
              onClick={fetchCustomers}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Type</label>
              <select
                name="customerType"
                value={filterOptions.customerType}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                {uniqueCustomerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                name="status"
                value={filterOptions.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredCustomers.length} of {totalItems} customers
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No customers found. 
                  {searchTerm || filterOptions.customerType || filterOptions.status ? " Try clearing your filters." : ""}
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.customerId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {customer.customerId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="font-medium">{customer.customerName || 'Unnamed Customer'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {customer.customerAddress || 'No address'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <div>{customer.email}</div>
                    <div>{customer.mobile}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        customer.customerType === "Premium"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : customer.customerType === "Regular"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {customer.customerType || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(customer.createdTime)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        customer.status
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {customer.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleCustomerStatus(customer.customerId, customer.status)}
                        className={`${
                          customer.status
                            ? "text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            : "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        }`}
                        title={customer.status ? "Deactivate Customer" : "Activate Customer"}
                        disabled={loading}
                      >
                        {customer.status ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleEditCustomer(customer.customerId)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit Customer"
                        disabled={loading}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.customerId)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Customer"
                        disabled={loading}
                      >
                        <Trash2 className="w-5 h-5" />
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
              // Advanced pagination for many pages
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

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add New Customer</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddCustomer}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleFormChange}
                      placeholder="+880"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea
                      name="customerAddress"
                      value={formData.customerAddress}
                      onChange={handleFormChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Type</label>
                    <select
                      name="customerType"
                      value={formData.customerType}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="New">New</option>
                      <option value="Regular">Regular</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="status"
                      name="status"
                      checked={formData.status}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="status" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(false)}
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
                        Saving...
                      </span>
                    ) : (
                      'Add Customer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditCustomerModal && currentCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Edit Customer</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdateCustomer}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer ID</label>
                    <input
                      type="text"
                      value={currentCustomer.customerId}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea
                      name="customerAddress"
                      value={formData.customerAddress}
                      onChange={handleFormChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Type</label>
                    <select
                      name="customerType"
                      value={formData.customerType}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="New">New</option>
                      <option value="Regular">Regular</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editStatus"
                      name="status"
                      checked={formData.status}
                      onChange={handleFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="editStatus" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditCustomerModal(false)
                      setCurrentCustomer(null)
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
                        Updating...
                      </span>
                    ) : (
                      'Update Customer'
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