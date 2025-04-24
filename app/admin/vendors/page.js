"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, Edit, Trash2, AlertCircle, RefreshCw, Loader2, Check, X, Save } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"

export default function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [formData, setFormData] = useState({
    vendorId: 0,
    vendorName: "",
    contactPerson: "",
    vendorType: "",
    email: "",
    loginId: 0,
    street: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    paymentTerms: "",
    taxID_VATNumber: "",
    note: "",
    phoneNumber: "",
    status: true
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getAuthToken } = useAuth()

  useEffect(() => {
    fetchVendors()
  }, [])

  // Filtered vendors based on search term
  const filteredVendors = vendors.filter(vendor => 
    vendor.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.vendorType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.phoneNumber?.includes(searchTerm)
  )

  // Fetch vendors from API
  const fetchVendors = async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      const response = await fetch(`/api/proxy/api/v1/vendors?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Vendors API Response:", data)
      
      if (data.success) {
        // Handle the nested structure correctly
        if (data.data && data.data.result && Array.isArray(data.data.result)) {
          setVendors(data.data.result)
          
          // Store pagination info if available
          if (data.data.meta) {
            setPagination({
              page: data.data.meta.page || 1,
              limit: data.data.meta.limit || 10,
              total: data.data.meta.total || 0,
              totalPage: data.data.meta.totalPage || 1
            })
          }
        } else {
          console.warn("API returned success but no result array was found", data)
          setVendors([])
        }
      } else {
        // The API returned success: false
        if (data.message === "No Data Available") {
          // This is not an error, just no vendors yet
          setVendors([])
        } else {
          throw new Error(data.message || "Failed to fetch vendors")
        }
      }
    } catch (err) {
      console.error("Fetch vendors error:", err)
      setError("An error occurred while fetching vendors: " + err.message)
      setVendors([])
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes in form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }

  // Add new vendor
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      // Prepare payload
      const payload = {
        ...formData,
        vendorId: 0, // Ensure it's 0 for new vendor
        loginId: parseInt(formData.loginId) || 0,
        createdBy: 3 // Replace with actual user ID from auth context
      }
      
      console.log("Adding vendor with payload:", payload)
      
      const response = await fetch("/api/proxy/api/v1/vendors", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Add vendor response:", data)
      
      if (data.success) {
        toast.success("Vendor added successfully!")
        setShowAddForm(false)
        resetFormData()
        fetchVendors() // Refresh the list
      } else {
        throw new Error(data.message || "Failed to add vendor")
      }
    } catch (err) {
      console.error("Add vendor error:", err)
      toast.error("Failed to add vendor: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form data
  const resetFormData = () => {
    setFormData({
      vendorId: 0,
      vendorName: "",
      contactPerson: "",
      vendorType: "",
      email: "",
      loginId: 0,
      street: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "",
      paymentTerms: "",
      taxID_VATNumber: "",
      note: "",
      phoneNumber: "",
      status: true
    })
  }

  // Edit existing vendor
  const handleEditClick = (vendor) => {
    setFormData({
      ...vendor
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }

  // Update vendor
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      // Prepare payload
      const payload = {
        ...formData,
        loginId: parseInt(formData.loginId) || 0,
        modifiedBy: 3 // Replace with actual user ID from auth context
      }
      
      console.log("Updating vendor with payload:", payload)
      
      const response = await fetch(`/api/proxy/api/v1/vendors/${formData.vendorId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Update vendor response:", data)
      
      if (data.success) {
        toast.success("Vendor updated successfully!")
        setShowEditForm(false)
        resetFormData()
        fetchVendors() // Refresh the list
      } else {
        throw new Error(data.message || "Failed to update vendor")
      }
    } catch (err) {
      console.error("Update vendor error:", err)
      toast.error("Failed to update vendor: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete vendor
  const handleDelete = async (vendorId) => {
    if (!confirm("Are you sure you want to delete this vendor?")) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      console.log("Deleting vendor with ID:", vendorId)
      
      const response = await fetch(`/api/proxy/api/v1/vendors/${vendorId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Delete vendor response:", data)
      
      if (data.success) {
        toast.success("Vendor deleted successfully!")
        // Update the local state
        setVendors(vendors.filter(vendor => vendor.vendorId !== vendorId))
      } else {
        throw new Error(data.message || "Failed to delete vendor")
      }
    } catch (err) {
      console.error("Delete vendor error:", err)
      toast.error("Failed to delete vendor: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add this function to handle status toggle
  const handleStatusToggle = async (vendor) => {
    try {
      setIsSubmitting(true)
      
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      // Create payload with updated status
      const payload = {
        ...vendor,
        status: !vendor.status, // Toggle the status
        loginId: parseInt(vendor.loginId) || 0,
        modifiedBy: 3 // Replace with actual user ID from auth context
      }
      
      console.log("Updating vendor status:", payload)
      
      const response = await fetch(`/api/proxy/api/v1/vendors/${vendor.vendorId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Update status response:", data)
      
      if (data.success) {
        toast.success(`Vendor ${!vendor.status ? 'activated' : 'deactivated'} successfully!`)
        
        // Update vendor status in local state
        setVendors(prevVendors => 
          prevVendors.map(v => 
            v.vendorId === vendor.vendorId ? { ...v, status: !v.status } : v
          )
        )
      } else {
        throw new Error(data.message || "Failed to update vendor status")
      }
    } catch (err) {
      console.error("Update vendor status error:", err)
      toast.error("Failed to update status: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    fetchVendors(page, pagination.limit)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Vendor Management</h1>
        <button
          onClick={() => {
            setShowAddForm(true)
            setShowEditForm(false)
            resetFormData()
          }}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Vendor
        </button>
      </div>

      {error && (
        <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-1 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchVendors}
              className="text-[0.6rem] text-red-700 dark:text-red-400 underline mt-1 flex items-center"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Try again
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Vendor Form */}
      {(showAddForm || showEditForm) && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
              {showAddForm ? "Add New Vendor" : "Edit Vendor"}
            </h2>
            <button 
              onClick={() => {
                setShowAddForm(false)
                setShowEditForm(false)
              }} 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={showAddForm ? handleAddSubmit : handleEditSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Basic Information */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Vendor Name*
                  </label>
                  <input
                    type="text"
                    name="vendorName"
                    value={formData.vendorName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Vendor Type
                  </label>
                  <input
                    type="text"
                    name="vendorType"
                    value={formData.vendorType || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  />
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
                  Contact Information
                </h3>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Login ID (Optional)
                  </label>
                  <input
                    type="number"
                    name="loginId"
                    value={formData.loginId || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  />
                </div>
              </div>
              
              {/* Address */}
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
                  Address
                </h3>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Street
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street || ""}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ""}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="stateProvince"
                      value={formData.stateProvince || ""}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ""}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode || ""}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="space-y-2 md:col-span-2">
                <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
                  Additional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      name="paymentTerms"
                      value={formData.paymentTerms || ""}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                      Tax ID / VAT Number
                    </label>
                    <input
                      type="text"
                      name="taxID_VATNumber"
                      value={formData.taxID_VATNumber || ""}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Notes
                  </label>
                  <textarea
                    name="note"
                    value={formData.note || ""}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  ></textarea>
                </div>
              </div>
              
              {/* Status */}
              <div className="md:col-span-1">
                <div className="mb-2">
                  <div className="mt-1">
                    <label className="inline-flex items-center text-xs">
                      <input
                        type="checkbox"
                        name="status"
                        checked={formData.status}
                        onChange={handleInputChange}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-1 text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setShowEditForm(false)
                }}
                className="px-2 py-1 text-xs text-gray-700 bg-gray-200 rounded-md mr-1 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    {showAddForm ? "Saving..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    {showAddForm ? "Save Vendor" : "Update Vendor"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <Search className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-1" />
          <span className="text-xs text-gray-600 dark:text-gray-300">Loading vendors...</span>
        </div>
      ) : vendors.length > 0 ? (
        <>
          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Total vendors: {pagination.total || vendors.length}
            {pagination.totalPage > 1 && ` | Page ${pagination.page} of ${pagination.totalPage}`}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-1 text-right font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.vendorId} className="hover:bg-gray-50 dark:hover:bg-gray-700 h-8">
                    <td className="px-3 py-1 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {vendor.vendorName}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap">
                      <div className="text-gray-900 dark:text-white">{vendor.contactPerson || "-"}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-[0.65rem]">
                        {vendor.email && <span>{vendor.email}</span>}
                        {vendor.email && vendor.phoneNumber && <span> • </span>}
                        {vendor.phoneNumber && <span>{vendor.phoneNumber}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {vendor.vendorType || "-"}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap">
                      <div className="text-gray-900 dark:text-white">{[vendor.city, vendor.country].filter(Boolean).join(", ") || "-"}</div>
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleStatusToggle(vendor)}
                          disabled={isSubmitting}
                          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${
                            vendor.status 
                              ? 'bg-green-500 dark:bg-green-600' 
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          title={vendor.status ? "Active (click to deactivate)" : "Inactive (click to activate)"}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              vendor.status ? 'translate-x-4' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-[0.6rem] ${
                          vendor.status 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {vendor.status ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-right font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEditClick(vendor)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          disabled={isSubmitting}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.vendorId)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No vendors found with the given search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {pagination.totalPage > 1 && (
            <div className="mt-2 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Showing {filteredVendors.length} of {pagination.total} vendors
              </div>
              <div className="flex space-x-1">
                <button 
                  className={`px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-xs ${
                    pagination.page === 1 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.totalPage }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`px-2 py-0.5 rounded border text-xs ${
                      pagination.page === page
                        ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  className={`px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-xs ${
                    pagination.page >= pagination.totalPage 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  disabled={pagination.page >= pagination.totalPage}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No vendors found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-3 text-xs">Get started by adding your first vendor.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Vendor
          </button>
        </div>
      )}
    </div>
  )
}