"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Edit, Trash2, Plus, ChevronRight, ChevronDown, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [formData, setFormData] = useState({
    categoryName: "",
    parentId: "",
    description: "",
    status: true
  })
  const [expandedCategories, setExpandedCategories] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { getAuthToken } = useAuth()
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch categories from API
  async function fetchCategories(page = 1, limit = 10) {
    setLoading(true)
    setError(null)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        setError("Authentication token is missing. Please log in again.")
        setLoading(false)
        return
      }
      
      // Fetch main categories
      const response = await fetch(`/api/proxy/api/v1/category?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error: ${response.status}`)
      }
      
      const data = await response.json()
      
      let allCategories = []
      
      if (data.success) {
        // Process the categories from the API response
        const categoriesData = data.data.result || []
        
        // Set pagination data
        setPagination({
          page: data.data.meta.page || 1,
          limit: data.data.meta.limit || 10,
          total: data.data.meta.total || 0,
          totalPages: data.data.meta.totalPage || 1
        })
        
        // Transform API response to our component's format
        const formattedCategories = categoriesData.map(cat => ({
          id: cat.categoryId.toString(),
          name: cat.categoryName,
          slug: cat.categoryName.toLowerCase().replace(/\s+/g, "-"),
          status: cat.status !== undefined ? cat.status : true,
          parentId: null, // Main categories have no parent
          description: cat.description || "",
          imageUrl: cat.imageUrl || null,
          createdBy: cat.createdBy,
          isSubcategory: false // Flag to identify main categories
        }))
        
        allCategories = [...formattedCategories]
        
        // Now fetch subcategories
        const subcategories = await fetchSubcategories()
        
        // Combine categories and subcategories
        allCategories = [...allCategories, ...subcategories]
        
        setCategories(allCategories)
      } else {
        throw new Error(data.message || "Failed to fetch categories")
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError(err.message || "An error occurred while fetching categories")
    } finally {
      setLoading(false)
    }
  }

  // Add this function to fetch subcategories
  async function fetchSubcategories() {
    try {
      const token = getAuthToken()
      
      if (!token) {
        setError("Authentication token is missing. Please log in again.")
        return []
      }
      
      const response = await fetch(`/api/proxy/api/v1/subcategory`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Process the subcategories from the API response
        const subcategoriesData = data.data.result || []
        
        // Transform API response to our component's format
        const formattedSubcategories = subcategoriesData.map(subcat => ({
          id: subcat.subCategoryId.toString(),
          name: subcat.subCategoryName,
          slug: subcat.subCategoryName.toLowerCase().replace(/\s+/g, "-"),
          status: subcat.status !== undefined ? subcat.status : true,
          parentId: subcat.categoryId.toString(), // Link to parent category
          description: subcat.description || "",
          isSubcategory: true // Flag to identify subcategories
        }))
        
        return formattedSubcategories
      } else {
        console.warn("Failed to fetch subcategories:", data.message)
        return []
      }
    } catch (err) {
      console.error("Error fetching subcategories:", err)
      return []
    }
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Update handleAddSubmit to handle subcategories
const handleAddSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null)
  
  try {
    // Get authentication token
    const token = getAuthToken()
    
    if (!token) {
      setError("Authentication token is missing. Please log in again.")
      setIsSubmitting(false)
      return
    }
    
    // Determine if we're adding a subcategory
    const isSubcategory = !!formData.parentId
    
    if (isSubcategory) {
      // Create subcategory object for API
      const subcategoryData = {
        subCategoryId: 0, // New subcategory
        subCategoryName: formData.categoryName,
        categoryId: parseInt(formData.parentId),
        status: formData.status,
        createdBy: 3 // Use the user ID from the examples
      }
      
      // Add description if provided
      if (formData.description && formData.description.trim()) {
        subcategoryData.description = formData.description
      }
      
      console.log("Sending subcategory data:", subcategoryData)
      
      // Send request to the subcategory API
      const response = await fetch("/api/proxy/api/v1/subcategory", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subcategoryData)
      })
      
      const data = await response.json()
      console.log("API Response (subcategory):", data)
      
      if (data.success) {
        // Add new subcategory to local state
        const newSubcategory = {
          id: data.data.id.toString(), // Using the returned ID
          name: formData.categoryName,
          slug: formData.categoryName.toLowerCase().replace(/\s+/g, "-"),
          status: formData.status,
          parentId: formData.parentId,
          description: formData.description || "",
          isSubcategory: true
        }
        
        setCategories(prev => [...prev, newSubcategory])
        
        // Reset form
        setFormData({
          categoryName: "",
          parentId: "",
          description: "",
          status: true
        })
        setShowAddForm(false)
        
        // Show success message
        alert("Subcategory created successfully!")
        
        // Refresh categories to get the updated list
        fetchCategories()
      } else {
        throw new Error(data.message || "Failed to create subcategory")
      }
    } else {
      // Create main category object for API
      const categoryData = {
        categoryName: formData.categoryName,
        status: formData.status,
        createdBy: 3 // Use the user ID from the examples
      }
      
      // Add description if provided
      if (formData.description && formData.description.trim()) {
        categoryData.description = formData.description
      }
      
      console.log("Sending category data:", categoryData)
      
      // Send request to API
      const response = await fetch("/api/proxy/api/v1/category", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })
      
      const data = await response.json()
      console.log("API Response (category):", data)
      
      if (data.success) {
        // Add new category to local state
        const newCategory = {
          id: data.data.categoryId.toString(),
          name: formData.categoryName,
          slug: formData.categoryName.toLowerCase().replace(/\s+/g, "-"),
          status: formData.status,
          parentId: null,
          description: formData.description || "",
          isSubcategory: false
        }
        
        setCategories(prev => [...prev, newCategory])
        
        // Reset form
        setFormData({
          categoryName: "",
          parentId: "",
          description: "",
          status: true
        })
        setShowAddForm(false)
        
        // Show success message
        alert("Category created successfully!")
        
        // Refresh categories to get the updated list
        fetchCategories()
      } else {
        throw new Error(data.message || "Failed to create category")
      }
    }
  } catch (err) {
    console.error("Error creating category/subcategory:", err)
    setError(err.message || "An error occurred while creating the category/subcategory")
  } finally {
    setIsSubmitting(false)
  }
}

// Update handleEditSubmit to handle subcategories
const handleEditSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)
  setError(null)
  
  try {
    const token = getAuthToken()
    
    if (!token) {
      setError("Authentication token is missing. Please log in again.")
      setIsSubmitting(false)
      return
    }
    
    const isSubcategory = currentCategory.isSubcategory === true
    
    if (isSubcategory) {
      // Create subcategory object for API
      const subcategoryData = {
        subCategoryId: parseInt(currentCategory.id),
        subCategoryName: formData.categoryName,
        categoryId: parseInt(formData.parentId),
        status: formData.status,
        modifiedBy: 3 // Use the user ID from the examples
      }
      
      // Add description if provided
      if (formData.description && formData.description.trim()) {
        subcategoryData.description = formData.description
      }
      
      console.log("Updating subcategory:", subcategoryData)
      
      // Send request to API - use the subcategory endpoint
      const response = await fetch(`/api/proxy/api/v1/subcategory/${subcategoryData.subCategoryId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subcategoryData)
      })
      
      const data = await response.json()
      console.log("Update response (subcategory):", data)
      
      if (data.success) {
        // Update subcategory in local state
        setCategories(prev =>
          prev.map(cat =>
            cat.id === currentCategory.id
              ? {
                  ...cat,
                  name: formData.categoryName,
                  slug: formData.categoryName.toLowerCase().replace(/\s+/g, "-"),
                  parentId: formData.parentId,
                  description: formData.description || "",
                  status: formData.status
                }
              : cat
          )
        )
        
        // Reset form
        setFormData({
          categoryName: "",
          parentId: "",
          description: "",
          status: true
        })
        setCurrentCategory(null)
        setShowEditForm(false)
        
        // Show success message
        alert("Subcategory updated successfully!")
        
        // Refresh categories to get the updated list
        fetchCategories()
      } else {
        throw new Error(data.message || "Failed to update subcategory")
      }
    } else {
      // Create category object for API
      const categoryData = {
        categoryId: parseInt(currentCategory.id),
        categoryName: formData.categoryName,
        status: formData.status,
        modifiedBy: 3 // Use the user ID from the examples
      }
      
      // Add description if provided
      if (formData.description && formData.description.trim()) {
        categoryData.description = formData.description
      }
      
      console.log("Updating category:", categoryData)
      
      // Send request to API - use the correct endpoint format
      const response = await fetch(`/api/proxy/api/v1/category/${categoryData.categoryId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })
      
      const data = await response.json()
      console.log("Update response (category):", data)
      
      if (data.success) {
        // Update category in local state
        setCategories(prev =>
          prev.map(cat =>
            cat.id === currentCategory.id
              ? {
                  ...cat,
                  name: formData.categoryName,
                  slug: formData.categoryName.toLowerCase().replace(/\s+/g, "-"),
                  description: formData.description || "",
                  status: formData.status
                }
              : cat
          )
        )
        
        // Reset form
        setFormData({
          categoryName: "",
          parentId: "",
          description: "",
          status: true
        })
        setCurrentCategory(null)
        setShowEditForm(false)
        
        // Show success message
        alert("Category updated successfully!")
        
        // Refresh categories to get the updated list
        fetchCategories()
      } else {
        throw new Error(data.message || "Failed to update category")
      }
    }
  } catch (err) {
    console.error("Error updating category/subcategory:", err)
    setError(err.message || "An error occurred while updating the category/subcategory")
  } finally {
    setIsSubmitting(false)
  }
}

// Update handleDelete to handle subcategories
const handleDelete = async (categoryId, isSubcategory = false) => {
  const entityType = isSubcategory ? "subcategory" : "category"
  
  if (window.confirm(`Are you sure you want to delete this ${entityType}?`)) {
    setLoading(true)
    setError(null)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        setError("Authentication token is missing. Please log in again.")
        setLoading(false)
        return
      }
      
      console.log(`Deleting ${entityType} with ID: ${categoryId}`)
      
      // Send request to API - use the correct endpoint format based on entity type
      const endpoint = isSubcategory 
        ? `/api/proxy/api/v1/subcategory/${categoryId}` 
        : `/api/proxy/api/v1/category/${categoryId}`
      
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      console.log(`Delete response (${entityType}):`, data)
      
      if (data.success) {
        // Show success message
        alert(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} deleted successfully!`)
        
        // Remove category from local state
        setCategories(prev => prev.filter(cat => cat.id !== categoryId))
        
        // If it's a main category, also remove any subcategories
        if (!isSubcategory) {
          setCategories(prev => prev.filter(cat => cat.parentId !== categoryId))
        }
      } else {
        throw new Error(data.message || `Failed to delete ${entityType}`)
      }
    } catch (err) {
      console.error(`Error deleting ${entityType}:`, err)
      setError(err.message || `An error occurred while deleting the ${entityType}`)
    } finally {
      setLoading(false)
    }
  }
}

  // Set up edit form with category data
  const handleEdit = (category) => {
    setCurrentCategory(category)
    setFormData({
      categoryName: category.name,
      parentId: category.parentId || "",
      description: category.description || "",
      status: category.status !== undefined ? category.status : true
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }

  // Toggle category expansion
  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  // Updated parentCategories definition to check isSubcategory flag
  const parentCategories = categories.filter(cat => !cat.isSubcategory)

  // Updated getSubcategories function to check isSubcategory flag
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId && cat.isSubcategory === true)
  }

  // Fixed Next button in PaginationControls function
const PaginationControls = () => {
  if (pagination.totalPages <= 1) return null;
  
  return (
    <div className="mt-2 flex items-center justify-between">
      <div className="text-xs text-gray-600 dark:text-gray-400">
        Showing {categories.length} of {pagination.total} categories
      </div>
      
      <div className="flex space-x-1">
        <button
          onClick={() => fetchCategories(pagination.page - 1, pagination.limit)}
          disabled={pagination.page <= 1 || loading}
          className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
        >
          Previous
        </button>
        
        {/* Page numbers */}
        {[...Array(pagination.totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => fetchCategories(i + 1, pagination.limit)}
            disabled={pagination.page === i + 1 || loading}
            className={`px-2 py-0.5 border text-xs ${
              pagination.page === i + 1
                ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700'
                : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            } rounded-md`}
          >
            {i + 1}
          </button>
        ))}
        
        <button
          onClick={() => fetchCategories(pagination.page + 1, pagination.limit)}
          disabled={pagination.page >= pagination.totalPages || loading}
          className="px-2 py-0.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
        >
          Next
        </button>
      </div>
    </div>
  );
};

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Categories</h1>
        <div className="flex space-x-1">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="flex items-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-md text-xs"
            title="Refresh categories"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setShowEditForm(false)
              setFormData({
                categoryName: "",
                parentId: "",
                description: "",
                status: true
              })
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Category
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-1 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchCategories}
              className="text-[0.6rem] text-red-700 dark:text-red-400 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Add Category Form */}
      {showAddForm && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Add New Category</h2>
          <form id="addCategoryForm" onSubmit={handleAddSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Category Name*
                </label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Parent Category
                </label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                >
                  <option value="">None (Top Level)</option>
                  {parentCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                ></textarea>
              </div>

              <div>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-1 text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-2 py-1 mr-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {isSubmitting ? "Adding..." : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Category Form */}
      {showEditForm && currentCategory && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Edit Category</h2>
          <form id="editCategoryForm" onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Category Name*
                </label>
                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Parent Category
                </label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                >
                  <option value="">None (Top Level)</option>
                  {parentCategories
                    .filter((cat) => cat.id !== currentCategory.id) // Can't be its own parent
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                ></textarea>
              </div>

              <div>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-1 text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false)
                  setCurrentCategory(null)
                }}
                className="px-2 py-1 mr-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                {isSubmitting ? "Updating..." : "Update Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List - Modified to handle subcategories */}
{categories.length === 0 && !loading ? (
  <div className="text-center py-4">
    <p className="text-gray-500 dark:text-gray-400 mb-2 text-xs">No categories found.</p>
    <button
      onClick={() => setShowAddForm(true)}
      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
    >
      Add Your First Category
    </button>
  </div>
) : (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr className="text-xs">
          <th className="px-2 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Category Name
          </th>
          <th className="px-2 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Slug
          </th>
          <th className="px-2 py-1 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Parent Category
          </th>
          <th className="px-2 py-1 text-center font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Status
          </th>
          <th className="px-2 py-1 text-right font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {parentCategories.map((category) => (
          <React.Fragment key={category.id}>
                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 h-10">
              <td className="px-2 py-1 text-gray-900 dark:text-gray-100">
                <div className="flex items-center">
                  {getSubcategories(category.id).length > 0 ? (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="mr-1 text-gray-500 dark:text-gray-400"
                    >
                      {expandedCategories[category.id] ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  ) : (
                    <span className="w-3 mr-1"></span>
                  )}
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
              </td>
              <td className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">{category.slug}</td>
              <td className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">-</td>
              <td className="px-2 py-1 text-center">
                <span
                  className={`inline-flex items-center px-1 py-0.5 rounded-full text-[0.6rem] font-medium ${
                    category.status
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}
                >
                  {category.status ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-2 py-1 text-right">
                <div className="flex justify-end space-x-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, false)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            {/* Subcategories - explicitly pass isSubcategory=true when deleting */}
            {expandedCategories[category.id] &&
              getSubcategories(category.id).map((subcat) => (
                <tr
                  key={subcat.id}
                  className="bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-650 h-10"
                >
                  <td className="px-2 py-1 text-gray-900 dark:text-gray-100">
                    <div className="flex items-center pl-4">
                      <span className="w-3 mr-1"></span>
                      <span className="text-sm">{subcat.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">{subcat.slug}</td>
                  <td className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">{category.name}</td>
                  <td className="px-2 py-1 text-center">
                    <span
                      className={`inline-flex items-center px-1 py-0.5 rounded-full text-[0.6rem] font-medium ${
                        subcat.status
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}
                    >
                      {subcat.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-right">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleEdit(subcat)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subcat.id, true)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </React.Fragment>
        ))}
      </tbody>
    </table>
    {categories.length > 0 && <PaginationControls />}
  </div>
)}
    </div>
  )
}