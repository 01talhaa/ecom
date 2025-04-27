"use client"

import { useState, useEffect } from "react"
import { getProducts } from "@/lib/api"
import { Search, Filter, AlertTriangle, ArrowUpDown, Plus, Minus } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"

export default function InventoryManagement() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortField, setSortField] = useState("productName")
  const [sortDirection, setSortDirection] = useState("asc")
  const [showAdjustStock, setShowAdjustStock] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0)
  const [adjustmentType, setAdjustmentType] = useState("add")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [filterOptions, setFilterOptions] = useState({
    lowStock: false,
    outOfStock: false,
    category: "",
    brand: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  const { getAuthToken } = useAuth()

  // Move fetchProducts outside of useEffect so it can be called from elsewhere
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing");
      }
      
      // Use the adjuststock API to get current stock information
      const response = await fetch("/api/proxy/api/v1/adjuststock", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Format the data to match the structure our component expects
        const formattedProducts = data.data.result.map(item => ({
          ProductId: item.productId,
          productName: item.productName || `Product #${item.productId}`,
          CategoryName: item.categoryName || "Uncategorized",
          BrandName: item.branchName || "Unbranded",
          StockQuantity: item.balanceQty || 0,
          Thumbnail: null, // API doesn't provide images
          price: item.retailPrice,
          barcode: item.barcode,
          subcategory: item.subcategoryName,
          variant: item.variantName,
          branchId: item.branchId,
          wSalePrice: item.wSalePrice
        }));
        
        setProducts(formattedProducts);
      } else {
        throw new Error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // You might want to display an error message to the user
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Call the fetchProducts function when component mounts
    fetchProducts();
  }, []);

  // Get unique categories and brands for filters
  const categories = [...new Set(products.map((product) => product.CategoryName))]
  const brands = [...new Set(products.map((product) => product.BrandName))]

  // Handle search and filters
  const filteredProducts = products.filter((product) => {
    // Search term filter
    const matchesSearch =
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ProductId.toString().includes(searchTerm) ||
      product.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())

    // Category filter
    const matchesCategory = filterOptions.category ? product.CategoryName === filterOptions.category : true

    // Brand filter
    const matchesBrand = filterOptions.brand ? product.BrandName === filterOptions.brand : true

    // Stock filters
    const matchesLowStock = filterOptions.lowStock ? product.StockQuantity <= 10 && product.StockQuantity > 0 : true
    const matchesOutOfStock = filterOptions.outOfStock ? product.StockQuantity === 0 : true

    // If both stock filters are active, show both
    if (filterOptions.lowStock && filterOptions.outOfStock) {
      return matchesSearch && matchesCategory && matchesBrand && product.StockQuantity <= 10
    }

    return matchesSearch && matchesCategory && matchesBrand && matchesLowStock && matchesOutOfStock
  })

  // Handle sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    } else {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }
  })

  // Handle pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  // Handle sort change
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle stock adjustment
  const handleAdjustStock = (product) => {
    setCurrentProduct(product)
    setAdjustmentQuantity(0)
    setAdjustmentType("add")
    setAdjustmentReason("")
    setShowAdjustStock(true)
  }

  const handleStockAdjustmentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing");
      }
      
      // Prepare the payload according to API requirements
      const payload = {
        productId: currentProduct.ProductId,
        productVariantId: 0, // Update this if you have variant information
        adjustmentType: adjustmentType, // "add" or "remove"
        quantity: parseInt(adjustmentQuantity, 10)
      };
      
      // Call the stock adjustment API
      const response = await fetch("/api/proxy/api/v1/adjuststock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Show success notification (you could add a toast notification here)
        console.log("Stock adjusted successfully:", result.message);
        
        // Close the modal
        setShowAdjustStock(false);
        setCurrentProduct(null);
        
        // Now we can call fetchProducts since it's defined at component level
        fetchProducts();
      } else {
        throw new Error(result.message || "Failed to adjust stock");
      }
    } catch (error) {
      console.error("Error adjusting stock:", error);
      // Show error notification (you could add a toast notification here)
      alert(`Error: ${error.message || "Failed to adjust stock"}`);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilterOptions((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      lowStock: false,
      outOfStock: false,
      category: "",
      brand: "",
    })
    setSearchTerm("")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">Inventory Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                name="category"
                value={filterOptions.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
              <select
                name="brand"
                value={filterOptions.brand}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4 mt-8">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="lowStock"
                  checked={filterOptions.lowStock}
                  onChange={handleFilterChange}
                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Low Stock</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="outOfStock"
                  checked={filterOptions.outOfStock}
                  onChange={handleFilterChange}
                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Out of Stock</span>
              </label>
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
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Image
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("productName")}
              >
                <div className="flex items-center">
                  Product
                  <ArrowUpDown className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("CategoryName")}
              >
                <div className="flex items-center">
                  Category
                  <ArrowUpDown className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("StockQuantity")}
              >
                <div className="flex items-center">
                  Stock
                  <ArrowUpDown className="w-4 h-4 ml-1" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {currentItems.map((product) => (
              <tr key={product.ProductId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 relative">
                    <Image
                      src={product.Thumbnail || "/placeholder.svg"}
                      alt={product.productName}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                  <div className="font-medium">{product.productName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.ProductId}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{product.CategoryName}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{product.StockQuantity}</td>
                <td className="px-4 py-3 text-sm">
                  {product.StockQuantity === 0 ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-xs flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Out of Stock
                    </span>
                  ) : product.StockQuantity <= 10 ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
                      In Stock
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <button
                    onClick={() => handleAdjustStock(product)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-xs"
                  >
                    Adjust Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">
              {indexOfLastItem > filteredProducts.length ? filteredProducts.length : indexOfLastItem}
            </span>{" "}
            of <span className="font-medium">{filteredProducts.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
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
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustStock && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Adjust Stock for {currentProduct.productName}
              </h2>

              <form onSubmit={handleStockAdjustmentSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="text"
                    value={currentProduct.StockQuantity}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Adjustment Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="adjustmentType"
                        value="add"
                        checked={adjustmentType === "add"}
                        onChange={() => setAdjustmentType("add")}
                        className="text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> Add Stock
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="adjustmentType"
                        value="remove"
                        checked={adjustmentType === "remove"}
                        onChange={() => setAdjustmentType("remove")}
                        className="text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <Minus className="w-4 h-4 mr-1" /> Remove Stock
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(e.target.value)}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Adjustment
                  </label>
                  <textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustStock(false)
                      setCurrentProduct(null)
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
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

