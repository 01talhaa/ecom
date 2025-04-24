"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Search, Filter, Plus, Edit, Trash2, AlertCircle, Eye } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"

// Helper function to check for invalid image sources
const isValidImageSource = (src) => {
  if (!src) return false;
  if (typeof src !== 'string') return false;
  return !src.startsWith('blob:');
};

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    // Try to get stored preference from localStorage, default to 10 if not found
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('productsPerPage');
      return storedValue ? parseInt(storedValue, 10) : 10;
    }
    return 10; // Default for server-side rendering
  })
  const [sortField, setSortField] = useState("productName")
  const [sortDirection, setSortDirection] = useState("asc")
  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const { getAuthToken } = useAuth()
  
  // Process API response into proper product data
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
        // Replace blob URLs with placeholder
        thumbnail: isValidImageSource(product.thumbnail) ? product.thumbnail : "/placeholder.svg",
        // Get actual category name from our fetched categories if needed
        // The API response already includes categoryName, so we might not need this
        categoryName: product.categoryName || categoryMap[product.categoryId] || `Category ${product.categoryId}`
      };
    });
  };

  useEffect(() => {
    fetchCategories().then(() => {
      fetchProducts();
    });
    
    // Debug pagination values
    console.log({
      currentPage,
      totalItems,
      totalPages,
      itemsPerPage
    });
  }, [currentPage, sortField, sortDirection, searchTerm, itemsPerPage]); // Added itemsPerPage

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      const response = await fetch("/api/proxy/api/v1/category", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.data?.result) {
        setCategories(data.data.result);
        return data.data.result;
      } 
      return [];
    } catch (err) {
      console.error("Fetch categories error:", err)
      return [];
    }
  }

  // Fetch products from API with pagination parameters
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      setSelectedProducts([])
      setSelectAll(false)

      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      // Construct the API URL with pagination and sorting parameters
      let apiUrl = `/api/proxy/api/v1/product?page=${currentPage}`;
      // Only add the limit if we need to override the API default
      if (itemsPerPage !== 100) { // Assuming 100 is the API default
        apiUrl += `&limit=${itemsPerPage}`;
      }
      
      // Add sorting parameters if they exist
      if (sortField) {
        apiUrl += `&sortBy=${sortField}&sortOrder=${sortDirection}`;
      }
      
      // Add search term if it exists
      if (searchTerm) {
        apiUrl += `&search=${encodeURIComponent(searchTerm)}`;
      }

      console.log("Fetching products from:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("API response:", data);

      if (data.success) {
        // Process the data to handle blob URLs and add necessary fields
        const processedProducts = processProductData(data, categories);
        setProducts(processedProducts);
        
        // Set total items for pagination based on the API response structure
        if (data.data?.meta?.total) {
          setTotalItems(data.data.meta.total);
          console.log("Total items set from meta.total:", data.data.meta.total);
          
          // Also log the totalPage value to verify
          if (data.data?.meta?.totalPage) {
            console.log("Total pages from API:", data.data.meta.totalPage);
          }
        } else if (data.data?.totalPage) {
          // If we have totalPage but not total items, calculate an estimate
          setTotalItems(data.data.totalPage * itemsPerPage);
          console.log("Total items estimated from totalPage:", data.data.totalPage * itemsPerPage);
        } else if (data.data?.result?.length) {
          // Last resort fallback
          setTotalItems(Math.max(data.data.result.length, itemsPerPage));
          console.log("Total items fallback to result length:", Math.max(data.data.result.length, itemsPerPage));
        } else {
          setTotalItems(0);
          console.log("No items found, setting total to 0");
        }
      } else {
        // The API returned success: false
        if (data.message === "No Data Available") {
          setProducts([])
          setTotalItems(0)
        } else {
          throw new Error(data.message || "Failed to fetch products")
        }
      }
    } catch (err) {
      console.error("Fetch products error:", err)
      setError("An error occurred while fetching products: " + err.message)
      setProducts([])
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }

  // useEffect hook to trigger fetch when search term changes
  useEffect(() => {
    // Add debounce for search to prevent too many API calls
    const delaySearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);  // Reset to page 1 when search changes
      } else {
        fetchProducts();  // If already on page 1, fetch directly
      }
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Handle sort change
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((product) => product.productId))
    }
    setSelectAll(!selectAll)
  }

  // Handle select one
  const handleSelectOne = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  // Delete product handler
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setDeleteLoading(true)
        
        const token = getAuthToken()
        if (!token) {
          throw new Error("Authentication token is missing")
        }

        const response = await fetch(`/api/proxy/api/v1/product/${productId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        // Assume success if no error was thrown
        // Update the UI by removing the deleted product
        setProducts(products.filter(product => product.productId !== productId))
        alert("Product deleted successfully")
        
        // Refresh the current page to get updated data
        fetchProducts()
        
      } catch (err) {
        console.error("Delete product error:", err)
        alert("Failed to delete product: " + err.message)
      } finally {
        setDeleteLoading(false)
      }
    }
  }

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        setDeleteLoading(true)
        
        const token = getAuthToken()
        if (!token) {
          throw new Error("Authentication token is missing")
        }

        // Process deletions sequentially
        for (const productId of selectedProducts) {
          const response = await fetch(`/api/proxy/api/v1/product/${productId}`, {
            method: "DELETE",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            throw new Error(`Failed to delete product ID ${productId}: ${response.status}`)
          }
        }

        alert("Products deleted successfully")
        // Refresh the product list after deletion
        fetchProducts()
        
      } catch (err) {
        console.error("Bulk delete error:", err)
        alert("Failed to delete some products: " + err.message)
        // Refresh the product list to ensure UI is in sync with server
        fetchProducts()
      } finally {
        setDeleteLoading(false)
      }
    }
  }

  // Calculate total pages from totalItems
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setItemsPerPage(newValue);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('productsPerPage', newValue.toString());
    }
    
    // Reset to first page when changing items per page
    setCurrentPage(1);
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">Products</h1>
        <Link
          href="/admin/products/add"
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-1 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchProducts}
              className="text-[0.6rem] text-red-700 dark:text-red-400 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <Search className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md text-xs">
            <Filter className="w-3 h-3 mr-1" />
            Filter
          </button>

          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleteLoading}
              className={`flex items-center ${
                deleteLoading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
              } text-white px-3 py-1.5 rounded-md text-xs`}
            >
              {deleteLoading ? (
                <>
                  <span className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete ({selectedProducts.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {products.length === 0 && !loading && !error ? (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-3 text-xs">Get started by adding your first product.</p>
          <Link
            href="/admin/products/add"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-xs">
                <th className="w-8 px-2 py-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
                <th className="w-12 px-2 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Image
                </th>
                <th
                  className="px-2 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("productName")}
                >
                  Product Name
                  {sortField === "productName" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th
                  className="px-2 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("categoryName")}
                >
                  Category
                  {sortField === "categoryName" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </th>
                <th className="px-2 py-2 text-right font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {products.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.productId)}
                      onChange={() => handleSelectOne(product.productId)}
                      className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="w-8 h-8 relative rounded-md overflow-hidden">
                      {!isValidImageSource(product.thumbnail) ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                          <span className="text-gray-500 dark:text-gray-400 text-base font-medium">
                            {product.productName ? product.productName.charAt(0).toUpperCase() : 'P'}
                          </span>
                        </div>
                      ) : (
                        <Image
                          src={product.thumbnail}
                          alt={product.productName || "Product thumbnail"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2 text-gray-900 dark:text-gray-100 text-sm">{product.productName}</td>
                  <td className="px-2 py-2 text-gray-500 dark:text-gray-400 text-xs">{product.categoryName}</td>
                  <td className="px-2 py-2 text-right">
                    <div className="flex justify-end space-x-1">
                      <Link
                        href={`/admin/products/view/${product.productId}`}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/products/edit/${product.productId}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.productId)}
                        disabled={deleteLoading}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 pb-2 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 mb-3 sm:mb-0 w-full sm:w-auto">
          <div className="text-xs text-gray-700 dark:text-gray-300 w-full sm:w-auto text-center sm:text-left">
            {products.length > 0 ? (
              <>
                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </>
            ) : (
              "No results found"
            )}
          </div>
          
          {/* Items per page selector */}
          <div className="flex items-center gap-2 text-xs ml-3">
            <label htmlFor="itemsPerPage" className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Show per page:
            </label>
            <div className="relative">
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full py-1.5 px-3 pr-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Only show pagination controls when we have multiple pages */}
        {totalPages > 1 && (
          <div className="flex flex-wrap gap-1 justify-center w-full sm:w-auto">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || loading}
              className={`px-2 py-1 rounded-md text-xs ${
                currentPage === 1 || loading
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              First
            </button>
            
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className={`px-2 py-1 rounded-md text-xs ${
                currentPage === 1 || loading
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.max(1, Math.min(totalPages, 5)) }, (_, i) => {
              // Calculate appropriate page numbers based on current page
              let pageNum;
              if (totalPages <= 5) {
                // If 5 or fewer pages, show all
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                // If near the start, show first 5
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // If near the end, show last 5
                pageNum = totalPages - 4 + i;
              } else {
                // Otherwise show 2 before, current, and 2 after
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  disabled={loading}
                  className={`px-2 py-1 rounded-md text-xs min-w-[28px] ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white font-medium"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className={`px-2 py-1 rounded-md text-xs ${
                currentPage === totalPages || loading
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Next
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || loading}
              className={`px-2 py-1 rounded-md text-xs ${
                currentPage === totalPages || loading
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Last
            </button>
          </div>
        )}
      </div>
    </div>
  )
}