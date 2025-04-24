"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, AlertCircle, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image"

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 0
  })
  const [formData, setFormData] = useState({
    brandId: 0,
    brandName: "",
    shortName: "",
    description: "",
    logo: "",
    status: true
  })
  const { getAuthToken } = useAuth()

  useEffect(() => {
    fetchBrands()
  }, [])

  // Debug function for API responses
  const logApiData = (data, source) => {
    console.log(`API Response from ${source}:`, data)
    console.log("Response structure:", {
      success: typeof data.success,
      message: data.message,
      data: data.data ? {
        meta: data.data.meta ? "exists" : "missing",
        result: Array.isArray(data.data.result) ? `array[${data.data.result.length}]` : typeof data.data.result
      } : "missing"
    })
  }

  // Update the fetchBrands function to support pagination

const fetchBrands = async () => {
  try {
    setLoading(true)
    setError(null)

    const token = getAuthToken()
    if (!token) {
      throw new Error("Authentication token is missing")
    }

    // Include current pagination parameters in the API request
    const url = `/api/proxy/api/v1/brand?page=${pagination.page}&limit=${pagination.limit}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    logApiData(data, "fetchBrands")

    if (data.success) {
      // Handle the nested structure correctly
      if (data.data && data.data.result && Array.isArray(data.data.result)) {
        setBrands(data.data.result)
        
        // Store pagination info if available
        if (data.data.meta) {
          setPagination({
            page: data.data.meta.page || 1,
            limit: data.data.meta.limit || 10,
            total: data.data.meta.total || 0,
            totalPage: data.data.meta.totalPage || 0
          })
        }
      } else {
        console.warn("API returned success but no result array was found", data)
        setBrands([])
      }
    } else {
      // The API returned success: false
      if (data.message === "No Data Available") {
        // This is not an error, just no brands yet
        setBrands([])
      } else {
        throw new Error(data.message || "Failed to fetch brands")
      }
    }
  } catch (err) {
    console.error("Fetch brands error:", err)
    setError("An error occurred while fetching brands: " + err.message)
    setBrands([])
  } finally {
    setLoading(false)
  }
}

  const handleDelete = async (brandId) => {
    if (window.confirm("Are you sure you want to delete this brand?")) {
      try {
        setLoading(true)
        
        const token = getAuthToken()
        if (!token) {
          throw new Error("Authentication token is missing")
        }

        const response = await fetch(`/api/proxy/api/v1/brand/${brandId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        logApiData(data, "handleDelete")

        if (data.success) {
          // Remove the deleted brand from the state
          setBrands(brands.filter(brand => brand.brandId !== brandId))
          alert("Brand deleted successfully")
        } else {
          throw new Error(data.message || "Failed to delete brand")
        }
        
      } catch (err) {
        console.error("Delete brand error:", err)
        alert("Failed to delete brand: " + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAddEditSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const isEdit = formData.brandId > 0
      const url = isEdit 
        ? `/api/proxy/api/v1/brand/${formData.brandId}` 
        : "/api/proxy/api/v1/brand"
      
      const method = isEdit ? "PUT" : "POST"

      // Prepare payload according to API requirements
      const payload = {
        brandId: formData.brandId || 0,
        brandName: formData.brandName,
        shortName: formData.shortName || formData.brandName.substring(0, 10), // Use first 10 chars if not provided
        status: formData.status,
        createdBy: 3 // Default to user ID 3 or get from auth context
      }

      // Only include description and logo if they exist in your backend model
      // Remove these if your API doesn't accept them
      if (formData.description) payload.description = formData.description
      if (formData.logo) payload.logo = formData.logo

      console.log(`${isEdit ? "Updating" : "Creating"} brand with payload:`, payload)

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      logApiData(data, `handleAddEditSubmit - ${isEdit ? "edit" : "add"}`)

      if (data.success) {
        if (isEdit) {
          // Update the existing brand in the state
          setBrands(brands.map(brand => 
            brand.brandId === formData.brandId ? {...brand, ...payload} : brand
          ))
          setShowEditForm(false)
        } else {
          // For new brand, get the ID from the response
          if (data.data && data.data.id) {
            // Create a new brand object with the returned ID
            const newBrand = {
              ...payload,
              brandId: data.data.id
            }
            
            // Add the new brand to the local state
            setBrands([...brands, newBrand])
          }
          setShowAddForm(false)
        }
        
        // Reset form
        setFormData({
          brandId: 0,
          brandName: "",
          shortName: "",
          description: "",
          logo: "",
          status: true
        })
        
        alert(`Brand ${isEdit ? "updated" : "added"} successfully`)
        
        // Refresh brands list to ensure we have the latest data
        fetchBrands()
      } else {
        throw new Error(data.message || `Failed to ${isEdit ? "update" : "add"} brand`)
      }
      
    } catch (err) {
      console.error(`${formData.brandId ? "Update" : "Add"} brand error:`, err)
      alert(`Failed to ${formData.brandId ? "update" : "add"} brand: ` + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const handleEditClick = (brand) => {
    setFormData({
      brandId: brand.brandId,
      brandName: brand.brandName,
      shortName: brand.shortName || "",
      description: brand.description || "",
      logo: brand.logo || "",
      status: brand.status
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }))
    fetchBrands()
  }

  // Make sure brands is an array before filtering
  const filteredBrands = Array.isArray(brands) 
    ? brands.filter(brand => 
        brand.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  if (loading && brands.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Brand Management</h1>
        <button
          onClick={() => {
            setFormData({
              brandId: 0,
              brandName: "",
              shortName: "",
              description: "",
              logo: "",
              status: true
            })
            setShowAddForm(true)
            setShowEditForm(false)
          }}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Brand
        </button>
      </div>

      {error && (
        <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-1 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchBrands}
              className="text-[0.6rem] text-red-700 dark:text-red-400 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Add Brand Form */}
      {showAddForm && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Add New Brand</h2>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              ×
            </button>
          </div>
          <form onSubmit={handleAddEditSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Brand Name*
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Short Name
                </label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="Max 10 characters"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Logo URL
                </label>
                <input
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Status
                </label>
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
            
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2 py-1 text-xs text-gray-700 bg-gray-200 rounded-md mr-1 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  'Save Brand'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Brand Form */}
      {showEditForm && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Edit Brand</h2>
            <button onClick={() => setShowEditForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              ×
            </button>
          </div>
          <form onSubmit={handleAddEditSubmit}>
            <input type="hidden" name="brandId" value={formData.brandId} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Brand Name*
                </label>
                <input
                  type="text"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Short Name
                </label>
                <input
                  type="text"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleInputChange}
                  maxLength={10}
                  placeholder="Max 10 characters"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Logo URL
                </label>
                <input
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Status
                </label>
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
            
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="px-2 py-1 text-xs text-gray-700 bg-gray-200 rounded-md mr-1 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Updating...
                  </>
                ) : (
                  'Update Brand'
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
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Show total items and pagination info */}
      {brands.length > 0 && (
        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Total brands: {pagination.total || brands.length}
          {pagination.totalPage > 1 && ` | Page ${pagination.page} of ${pagination.totalPage}`}
        </div>
      )}

      {/* Empty state */}
      {brands.length === 0 && !loading && !error ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No brands found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-3 text-xs">Get started by adding your first brand.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Brand
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Brand ID
                </th>
                <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Brand Name
                </th>
                <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Short Name
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
              {filteredBrands.map((brand) => (
                <tr key={brand.brandId} className="hover:bg-gray-50 dark:hover:bg-gray-700 h-10">
                  <td className="px-3 py-1 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {brand.brandId}
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap font-medium text-gray-900 dark:text-white text-sm">
                    {brand.brandName}
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-gray-500 dark:text-gray-400 text-xs">
                    {brand.shortName || "-"}
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <span className={`px-1 py-0.5 rounded-full text-[0.6rem] ${
                      brand.status 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {brand.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-right font-medium">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleEditClick(brand)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.brandId)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBrands.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No brands found with the given search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPage > 1 && (
        <div className="mt-2 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredBrands.length} of {pagination.total} brands
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
    </div>
  )
}