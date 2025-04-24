"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, AlertCircle, Image as ImageIcon } from "lucide-react"

// Add getAuthToken function if not already available from useAuth() hook
const getAuthToken = () => {
  // Replace this with your actual token retrieval logic
  return localStorage.getItem('authToken') || "your-auth-token";
};

export default function UnitsPage() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [formData, setFormData] = useState({
    unitId: 0,
    unitName: "",
    unitValue: "",
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
    fetchUnits()
  }, [])

  // Filtered units based on search term
  const filteredUnits = units.filter(unit => 
    unit.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fetch units from API
  const fetchUnits = async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      const response = await fetch(`/api/proxy/api/v1/unit?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Units API Response:", data)
      
      if (data.success) {
        // Handle the nested structure correctly
        if (data.data && data.data.result && Array.isArray(data.data.result)) {
          setUnits(data.data.result)
          
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
          setUnits([])
        }
      } else {
        // The API returned success: false
        if (data.message === "No Data Available") {
          // This is not an error, just no units yet
          setUnits([])
        } else {
          throw new Error(data.message || "Failed to fetch units")
        }
      }
    } catch (err) {
      console.error("Fetch units error:", err)
      setError("An error occurred while fetching units: " + err.message)
      setUnits([])
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

  // Add new unit
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
        unitId: 0,
        unitName: formData.unitName,
        unitValue: parseFloat(formData.unitValue) || 0,
        status: formData.status,
        createdBy: 3 // Replace with actual user ID from auth context
      }
      
      console.log("Adding unit with payload:", payload)
      
      const response = await fetch("/api/proxy/api/v1/unit", {
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
      console.log("Add unit response:", data)
      
      if (data.success) {
        alert("Unit added successfully!")
        setShowAddForm(false)
        setFormData({
          unitId: 0,
          unitName: "",
          unitValue: "",
          status: true
        })
        fetchUnits() // Refresh the list
      } else {
        throw new Error(data.message || "Failed to add unit")
      }
    } catch (err) {
      console.error("Add unit error:", err)
      alert("Failed to add unit: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Edit existing unit
  const handleEditClick = (unit) => {
    setFormData({
      unitId: unit.unitId,
      unitName: unit.unitName,
      unitValue: unit.unitValue || "",
      status: unit.status !== undefined ? unit.status : true
    })
    setShowEditForm(true)
  }

  // Update unit
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
        unitId: formData.unitId,
        unitName: formData.unitName,
        unitValue: parseFloat(formData.unitValue) || 0,
        status: formData.status,
        modifiedBy: 3 // Replace with actual user ID from auth context
      }
      
      console.log("Updating unit with payload:", payload)
      
      const response = await fetch(`/api/proxy/api/v1/unit/${formData.unitId}`, {
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
      console.log("Update unit response:", data)
      
      if (data.success) {
        alert("Unit updated successfully!")
        setShowEditForm(false)
        setFormData({
          unitId: 0,
          unitName: "",
          unitValue: "",
          status: true
        })
        fetchUnits() // Refresh the list
      } else {
        throw new Error(data.message || "Failed to update unit")
      }
    } catch (err) {
      console.error("Update unit error:", err)
      alert("Failed to update unit: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete unit
  const handleDelete = async (unitId) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      setLoading(true)
      
      try {
        const token = getAuthToken()
        
        if (!token) {
          throw new Error("Authentication token is missing")
        }
        
        console.log("Deleting unit with ID:", unitId)
        
        const response = await fetch(`/api/proxy/api/v1/unit/${unitId}`, {
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
        console.log("Delete unit response:", data)
        
        if (data.success) {
          alert("Unit deleted successfully!")
          // Update the local state to remove the deleted unit
          setUnits(units.filter(unit => unit.unitId !== unitId))
        } else {
          throw new Error(data.message || "Failed to delete unit")
        }
      } catch (err) {
        console.error("Delete unit error:", err)
        alert("Failed to delete unit: " + err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    fetchUnits(page, pagination.limit)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Unit Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Unit
        </button>
      </div>

      {error && (
        <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-1 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchUnits}
              className="text-[0.6rem] text-red-700 dark:text-red-400 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Add New Unit</h2>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              ×
            </button>
          </div>
          <form onSubmit={handleAddSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Unit Name*
                </label>
                <input
                  type="text"
                  name="unitName"
                  value={formData.unitName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  placeholder="e.g. Kilogram, Piece, Liter"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Unit Value
                </label>
                <input
                  type="number"
                  name="unitValue"
                  value={formData.unitValue}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  placeholder="Base value (e.g. 1.0)"
                />
              </div>
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
                    <span className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  'Save Unit'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditForm && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Edit Unit</h2>
            <button onClick={() => setShowEditForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              ×
            </button>
          </div>
          <form onSubmit={handleEditSubmit}>
            <input type="hidden" name="unitId" value={formData.unitId} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Unit Name*
                </label>
                <input
                  type="text"
                  name="unitName"
                  value={formData.unitName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  placeholder="e.g. Kilogram, Piece, Liter"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Unit Value
                </label>
                <input
                  type="number"
                  name="unitValue"
                  value={formData.unitValue}
                  onChange={handleInputChange}
                  step="0.01"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                  placeholder="Base value (e.g. 1.0)"
                />
              </div>
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
                    <span className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Updating...
                  </>
                ) : (
                  'Update Unit'
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
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {units.length > 0 && (
        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Total units: {pagination.total || units.length}
          {pagination.totalPage > 1 && ` | Page ${pagination.page} of ${pagination.totalPage}`}
        </div>
      )}

      {units.length === 0 && !loading && !error ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No units found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-3 text-xs">Get started by adding your first unit.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Unit
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unit ID
                </th>
                <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unit Name
                </th>
                <th scope="col" className="px-3 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unit Value
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
              {filteredUnits.map((unit) => (
                <tr key={unit.unitId} className="hover:bg-gray-50 dark:hover:bg-gray-700 h-10">
                  <td className="px-3 py-1 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {unit.unitId}
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {unit.unitName}
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {unit.unitValue || "-"}
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap">
                    <span className={`px-1 py-0.5 rounded-full text-[0.6rem] ${
                      unit.status 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {unit.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-1 whitespace-nowrap text-right font-medium">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleEditClick(unit)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(unit.unitId)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No units found with the given search criteria
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
            Showing {filteredUnits.length} of {pagination.total} units
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