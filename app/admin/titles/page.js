"use client"

import React, { useState, useEffect } from "react"
import { Search, Edit, Trash2, Plus, RefreshCw, AlertCircle, Save, X, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export default function TitlesPage() {
  const [titles, setTitles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [formData, setFormData] = useState({
    titleId: 0,
    titleName: "",
    status: true
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTitles()
  }, [])

  // Filtered titles based on search term
  const filteredTitles = titles.filter(title => 
    title.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fetch titles from API
  const fetchTitles = async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      // Fixed API URL - removed v1
      const response = await fetch(`/api/proxy/api/specificationtitle?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Titles API Response:", data)
      
      if (data.success) {
        let titlesData = [];
        let paginationData = { ...pagination };
        
        // Handle different API response structures
        if (data.data && Array.isArray(data.data)) {
          titlesData = data.data;
          
          // If pagination metadata is available
          if (data.meta) {
            paginationData = {
              page: data.meta.page || 1,
              limit: data.meta.limit || 10,
              total: data.meta.total || data.data.length,
              totalPage: data.meta.totalPage || 1
            };
          }
        } else if (data.data && data.data.result && Array.isArray(data.data.result)) {
          // Alternative response structure
          titlesData = data.data.result.map(item => ({
            titleId: item.titleId, 
            name: item.titleName || item.name,  // Handle both field names
            status: item.status
          }));
          
          // Store pagination info if available
          if (data.data.meta) {
            paginationData = {
              page: data.data.meta.page || 1,
              limit: data.data.meta.limit || 10,
              total: data.data.meta.total || data.data.result.length,
              totalPage: data.data.meta.totalPage || 1
            };
          }
        } else {
          console.warn("API returned success but no titles array was found", data);
        }
        
        setTitles(titlesData);
        setPagination(paginationData);
        
      } else {
        // The API returned success: false
        if (data.message === "No Data Available") {
          // This is not an error, just no titles yet
          setTitles([])
        } else {
          throw new Error(data.message || "Failed to fetch titles")
        }
      }
    } catch (err) {
      console.error("Fetch titles error:", err)
      setError("An error occurred while fetching titles: " + err.message)
      setTitles([])
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

  // Add new title
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.titleName.trim()) {
      toast.error("Title name is required")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      // Prepare payload
      const payload = {
        titleId: 0,
        titleName: formData.titleName,
        status: formData.status,
        createdBy: 0 // This will be handled by the backend
      }
      
      console.log("Adding title with payload:", payload)
      
      // Fixed API URL - removed v1
      const response = await fetch("/api/proxy/api/specificationtitle", {
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
      console.log("Add title response:", data)
      
      if (data.success) {
        toast.success("Title added successfully!")
        setShowAddForm(false)
        setFormData({
          titleId: 0,
          titleName: "",
          status: true
        })
        fetchTitles() // Refresh the list
      } else {
        throw new Error(data.message || "Failed to add title")
      }
    } catch (err) {
      console.error("Add title error:", err)
      toast.error("Failed to add title: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit existing title
  const handleEditClick = (title) => {
    setFormData({
      titleId: title.titleId,
      titleName: title.name || "",
      status: title.status !== undefined ? title.status : true
    })
    setShowEditForm(true)
  }

  // Update title
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.titleName.trim()) {
      toast.error("Title name is required")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      // Prepare payload
      const payload = {
        titleId: formData.titleId,
        titleName: formData.titleName,
        status: formData.status,
        createdBy: 0 // This will be handled by the backend
      }
      
      console.log("Updating title with payload:", payload)
      
      // Fixed API URL - removed v1
      const response = await fetch(`/api/proxy/api/specificationtitle/${formData.titleId}`, {
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
      console.log("Update title response:", data)
      
      if (data.success) {
        toast.success("Title updated successfully!")
        setShowEditForm(false)
        setFormData({
          titleId: 0,
          titleName: "",
          status: true
        })
        fetchTitles() // Refresh the list
      } else {
        throw new Error(data.message || "Failed to update title")
      }
    } catch (err) {
      console.error("Update title error:", err)
      toast.error("Failed to update title: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete title
  const handleDelete = async (titleId) => {
    if (!confirm("Are you sure you want to delete this title?")) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      console.log("Deleting title with ID:", titleId)
      
      // Fixed API URL - removed v1
      const response = await fetch(`/api/proxy/api/specificationtitle/${titleId}`, {
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
      console.log("Delete title response:", data)
      
      if (data.success) {
        toast.success("Title deleted successfully!")
        // Update the local state to remove the deleted title
        setTitles(titles.filter(title => title.titleId !== titleId))
      } else {
        throw new Error(data.message || "Failed to delete title")
      }
    } catch (err) {
      console.error("Delete title error:", err)
      toast.error("Failed to delete title: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    fetchTitles(page, pagination.limit)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Specification Titles</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Title
        </button>
      </div>

      {error && (
        <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-1 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchTitles}
              className="text-[0.6rem] text-red-700 dark:text-red-400 underline mt-1 flex items-center"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Try again
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Add New Specification Title</h2>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleAddSubmit}>
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Title Name*
              </label>
              <input
                type="text"
                name="titleName"
                value={formData.titleName}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                placeholder="e.g. Size, Color, Material"
              />
            </div>
            
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
                disabled={isSubmitting}
                className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Save Title
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Edit Specification Title</h2>
            <button onClick={() => setShowEditForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleEditSubmit}>
            <input type="hidden" name="titleId" value={formData.titleId} />
            
            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Title Name*
              </label>
              <input
                type="text"
                name="titleName"
                value={formData.titleName}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                placeholder="e.g. Size, Color, Material"
              />
            </div>
            
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
                disabled={isSubmitting}
                className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Update Title
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
            placeholder="Search titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-1" />
          <span className="text-xs text-gray-600 dark:text-gray-300">Loading titles...</span>
        </div>
      ) : titles.length > 0 ? (
        <>
          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Total titles: {pagination.total || titles.length}
            {pagination.totalPage > 1 && ` | Page ${pagination.page} of ${pagination.totalPage}`}
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title ID
                  </th>
                  <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title Name
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
                {filteredTitles.map((title) => (
                  <tr key={title.titleId} className="hover:bg-gray-50 dark:hover:bg-gray-700 h-8">
                    <td className="px-3 py-1 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {title.titleId}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {title.name}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap">
                      <span className={`px-1 py-0.5 rounded-full text-[0.6rem] ${
                        title.status 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {title.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-right font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEditClick(title)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          disabled={isSubmitting}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(title.titleId)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTitles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No titles found with the given search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {pagination.totalPage > 1 && (
            <div className="mt-2 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Showing {filteredTitles.length} of {pagination.total} titles
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
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No specification titles found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-3 text-xs">Get started by adding your first specification title.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Specification Title
          </button>
        </div>
      )}
    </div>
  )
}