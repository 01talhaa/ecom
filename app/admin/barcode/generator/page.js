"use client"

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, Printer, CheckSquare, Square, X, BarChart3, ChevronDown, Settings, Eye, Download, RefreshCw, Plus, Minus, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { useAuth } from "@/context/AuthContext"
import { useReactToPrint } from 'react-to-print'
import JsBarcode from 'jsbarcode'

export default function BarcodeGenerator() {
  // Authentication
  const { getAuthToken } = useAuth()

  // Products state
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  
  // Selection state
  const [selectedProducts, setSelectedProducts] = useState([])
  const [quantityMap, setQuantityMap] = useState({})
  const [cartItems, setCartItems] = useState([])
  
  // Barcode settings state
  const [labelSettings, setLabelSettings] = useState({
    layout: "30-per-page", // 30-per-page, 24-per-page, 2x1-roll
    showPrice: true,
    showName: true,
    showSku: true,
    showBusinessName: false,
    businessName: "EcomStore",
    barcodeFormat: "CODE128",
    width: 2,
    height: 50,
    fontSize: 12,
    marginTop: 10
  })
  
  // Preview state
  const [generatedBarcodes, setGeneratedBarcodes] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [generating, setGenerating] = useState(false)
  
  // Print references
  const printRef = useRef(null)
  
  // Fetch categories and products on initial load
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [currentPage, itemsPerPage, categoryFilter])
  
  // Apply search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1) // Reset to page 1 when search changes
      } else {
        fetchProducts() // Fetch directly if already on page 1
      }
    }, 300)
    
    return () => clearTimeout(delaySearch)
  }, [searchTerm])
  
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
        setCategories(data.data.result)
      }
    } catch (err) {
      console.error("Fetch categories error:", err)
      setError("Failed to load categories.")
    }
  }
  
  // Fetch products from API with pagination, filtering
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      // Construct the API URL with pagination and filter parameters
      let apiUrl = `/api/proxy/api/v1/product?page=${currentPage}&limit=${itemsPerPage}`
      
      // Add category filter if selected
      if (categoryFilter !== "all") {
        apiUrl += `&categoryId=${categoryFilter}`
      }
      
      // Add search term if provided
      if (searchTerm) {
        apiUrl += `&search=${encodeURIComponent(searchTerm)}`
      }
      
      // Add additional parameters useful for barcode generation
      apiUrl += `&fields=productName,sku,barcode,retailPrice,stockQuantity,thumbnail`

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

      if (data.success) {
        // Process products to ensure they have all necessary fields for barcode generation
        const processedProducts = data.data.result.map(product => ({
          ...product,
          // Use existing barcode, or fall back to SKU, or generate a placeholder
          barcode: product.barcode || product.sku || `PROD${product.productId.toString().padStart(6, '0')}`,
          // Ensure we have a valid thumbnail or placeholder
          thumbnail: product.thumbnail || "/placeholder.svg"
        }))
        
        setProducts(processedProducts)
        
        // Set total items for pagination
        if (data.data?.meta?.total) {
          setTotalItems(data.data.meta.total)
        } else if (data.data?.totalPage) {
          setTotalItems(data.data.totalPage * itemsPerPage)
        } else {
          setTotalItems(Math.max(data.data.result.length, itemsPerPage))
        }
      } else {
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
    } finally {
      setLoading(false)
    }
  }
  
  // Add product to cart
  const addToCart = (product) => {
    const existingIndex = cartItems.findIndex(item => item.productId === product.productId);
    
    if (existingIndex >= 0) {
      // Product already exists in cart, update quantity
      const updatedItems = [...cartItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1
      };
      setCartItems(updatedItems);
    } else {
      // Add new product to cart
      setCartItems([...cartItems, {
        ...product,
        quantity: 1
      }]);
    }
  }
  
  // Remove product from cart
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  }
  
  // Update quantity of cart item
  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedItems);
  }
  
  // Generate barcodes for the cart items
  const generateBarcodes = () => {
    if (cartItems.length === 0) {
      alert("Please add at least one product to the cart.");
      return;
    }
    
    setGenerating(true);
    
    try {
      // Create an array of barcode objects for rendering
      const barcodes = [];
      
      cartItems.forEach(item => {
        // Add the requested number of barcodes for this product
        for (let i = 0; i < item.quantity; i++) {
          barcodes.push({
            id: `${item.productId}-${i}`,
            product: item,
            barcodeValue: item.barcode,
            settings: labelSettings
          });
        }
      });
      
      setGeneratedBarcodes(barcodes);
      setShowPreview(true);
      
      // After rendering is complete, initialize barcodes
      setTimeout(() => {
        initializeBarcodes();
        setGenerating(false);
      }, 100);
      
    } catch (error) {
      console.error("Error generating barcodes:", error);
      alert("An error occurred while generating barcodes.");
      setGenerating(false);
    }
  }
  
  // Initialize barcodes after DOM elements are ready
  const initializeBarcodes = () => {
    generatedBarcodes.forEach(barcode => {
      const barcodeElement = document.getElementById(`barcode-${barcode.id}`);
      if (barcodeElement) {
        try {
          JsBarcode(barcodeElement, barcode.barcodeValue, {
            format: labelSettings.barcodeFormat,
            width: labelSettings.width,
            height: labelSettings.height,
            displayValue: labelSettings.showSku,
            fontSize: labelSettings.fontSize,
            marginTop: labelSettings.marginTop,
            textMargin: 2
          });
        } catch (error) {
          console.error(`Error rendering barcode for ${barcode.id}:`, error);
          // Fallback for invalid barcode data
          if (barcodeElement) {
            const parent = barcodeElement.parentElement;
            if (parent) {
              const errorMsg = document.createElement('div');
              errorMsg.textContent = "Invalid barcode data";
              errorMsg.className = "text-red-500 text-xs";
              parent.replaceChild(errorMsg, barcodeElement);
            }
          }
        }
      }
    });
  }
  
  // Reset all cart
  const handleReset = () => {
    setCartItems([]);
    setGeneratedBarcodes([]);
    setShowPreview(false);
  }
  
  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Product Barcodes',
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        // Ensure barcodes are initialized
        initializeBarcodes();
        setTimeout(resolve, 500);
      });
    }
  });
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  // Get total number of barcode labels
  const getTotalBarcodeCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }
  
  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Barcode Generator</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Generate and print barcodes for your products</p>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Products */}
        <div className="w-full lg:w-3/5 xl:w-2/3 p-4 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Products</h2>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Filter className="w-3.5 h-3.5 mr-1.5" />
                  Filters
                  <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="mb-4">
              <div className="relative w-full mb-2">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Search by product name, SKU or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {showFilters && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="categoryFilter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        id="categoryFilter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="itemsPerPage" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Items per page
                      </label>
                      <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      >
                        <option value="12">12</option>
                        <option value="24">24</option>
                        <option value="36">36</option>
                        <option value="48">48</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading ? (
                Array(12).fill(0).map((_, index) => (
                  <div key={`loader-${index}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow animate-pulse">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))
              ) : products.length === 0 ? (
                <div className="col-span-full p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>No products found. Try adjusting your search or filters.</p>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.productId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="h-40 relative rounded-t-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={product.thumbnail || "/placeholder.svg"}
                        alt={product.productName}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={product.productName}>
                        {product.productName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        SKU: {product.sku || "N/A"}
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                        {formatCurrency(product.retailPrice || 0)}
                      </p>
                      
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full mt-3 flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add to Barcode Cart
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded-md text-xs ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    First
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-2 py-1 rounded-md text-xs ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    Prev
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        className={`px-2 py-1 rounded-md text-xs min-w-[24px] ${
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
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded-md text-xs ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    Next
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-2 py-1 rounded-md text-xs ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Barcode Generator */}
        <div className="hidden lg:block lg:w-2/5 xl:w-1/3 p-4 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          {/* Barcode Cart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Barcode Cart 
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  ({cartItems.length} products, {getTotalBarcodeCount()} barcodes)
                </span>
              </h2>
              
              <button 
                onClick={handleReset}
                className="text-sm flex items-center text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                disabled={cartItems.length === 0}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </button>
            </div>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Your barcode cart is empty</p>
                <p className="text-sm mt-2">Add products from the left panel to generate barcodes</p>
              </div>
            ) : (
              <>
                <div className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="py-3 first:pt-0 last:pb-0 flex items-center">
                      <div className="h-10 w-10 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-700 mr-3">
                        <Image
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.productName}>
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          SKU: {item.sku || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center ml-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 bg-gray-100 dark:bg-gray-700 rounded-l-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center p-1 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="p-1 bg-gray-100 dark:bg-gray-700 rounded-r-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={generateBarcodes}
                    disabled={cartItems.length === 0 || generating}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generate {getTotalBarcodeCount()} Barcodes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Barcode Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowSettings(!showSettings)}>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Label Settings
              </h2>
              <ChevronDown className={`w-5 h-5 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            </div>
            
            {showSettings && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="labelLayout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Label Layout
                    </label>
                    <select
                      id="labelLayout"
                      value={labelSettings.layout}
                      onChange={(e) => setLabelSettings({...labelSettings, layout: e.target.value})}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      <option value="30-per-page">30 Labels Per Page (2.625" x 1")</option>
                      <option value="24-per-page">24 Labels Per Page (3" x 1.25")</option>
                      <option value="20-per-page">20 Labels Per Page (4" x 1")</option>
                      <option value="10-per-page">10 Labels Per Page (4" x 2")</option>
                      <option value="2x1-roll">2" x 1" Roll</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="barcodeFormat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Barcode Format
                    </label>
                    <select
                      id="barcodeFormat"
                      value={labelSettings.barcodeFormat}
                      onChange={(e) => setLabelSettings({...labelSettings, barcodeFormat: e.target.value})}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    >
                      <option value="CODE128">CODE128 (Default)</option>
                      <option value="EAN13">EAN-13</option>
                      <option value="UPC">UPC</option>
                      <option value="CODE39">CODE39</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      value={labelSettings.businessName}
                      onChange={(e) => setLabelSettings({...labelSettings, businessName: e.target.value})}
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                      placeholder="Your Business Name"
                    />
                  </div>
                  
                  {/* Display Options */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Options</h3>
                    
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={labelSettings.showPrice}
                        onChange={() => setLabelSettings({...labelSettings, showPrice: !labelSettings.showPrice})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">Show Price</span>
                    </label>
                    
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={labelSettings.showName}
                        onChange={() => setLabelSettings({...labelSettings, showName: !labelSettings.showName})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">Show Product Name</span>
                    </label>
                    
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={labelSettings.showSku}
                        onChange={() => setLabelSettings({...labelSettings, showSku: !labelSettings.showSku})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">Show SKU/Barcode Number</span>
                    </label>
                    
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={labelSettings.showBusinessName}
                        onChange={() => setLabelSettings({...labelSettings, showBusinessName: !labelSettings.showBusinessName})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">Show Business Name</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Barcode Preview */}
          {showPreview && generatedBarcodes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Barcode Preview
                </h2>
                
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  Print All
                </button>
              </div>
              
              <div className="border rounded-lg border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Preview showing {Math.min(generatedBarcodes.length, 2)} of {generatedBarcodes.length} barcodes. 
                  Click "Print All" to print all {generatedBarcodes.length} barcodes.
                </p>
                
                <div className="space-y-3">
                  {generatedBarcodes.slice(0, 2).map((barcode) => (
                    <div key={barcode.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                      {labelSettings.showBusinessName && (
                        <div className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 mb-1">
                          {labelSettings.businessName}
                        </div>
                      )}
                      
                      {labelSettings.showName && (
                        <div className="text-sm font-medium text-center text-gray-900 dark:text-white mb-1 truncate">
                          {barcode.product.productName}
                        </div>
                      )}
                      
                      <div className="flex justify-center my-2">
                        <svg id={`barcode-${barcode.id}`} className="max-w-full"></svg>
                      </div>
                      
                      {labelSettings.showPrice && (
                        <div className="text-sm font-bold text-center text-gray-900 dark:text-white">
                          {formatCurrency(barcode.product.retailPrice || 0)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Cart Button (Shows on small screens) */}
      <div className="lg:hidden fixed bottom-4 right-4 z-10">
        <button
          onClick={() => document.getElementById('mobile-cart').classList.toggle('hidden')}
          className="bg-blue-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Mobile Cart Modal */}
      <div id="mobile-cart" className="hidden lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50">
        <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-white dark:bg-gray-800 rounded-t-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Barcode Cart 
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({cartItems.length} products, {getTotalBarcodeCount()} barcodes)
              </span>
            </h2>
            <button 
              onClick={() => document.getElementById('mobile-cart').classList.add('hidden')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[calc(70vh-60px)]">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Your barcode cart is empty</p>
                <p className="text-sm mt-2">Add products from the list to generate barcodes</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="py-3 first:pt-0 last:pb-0 flex items-center">
                      <div className="h-10 w-10 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-700 mr-3">
                        <Image
                          src={item.thumbnail || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.target.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={item.productName}>
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          SKU: {item.sku || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center ml-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 bg-gray-100 dark:bg-gray-700 rounded-l-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center p-1 border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="p-1 bg-gray-100 dark:bg-gray-700 rounded-r-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Cart
                  </button>
                  
                  <button
                    onClick={() => {
                      generateBarcodes();
                      document.getElementById('mobile-cart').classList.add('hidden');
                    }}
                    disabled={cartItems.length === 0 || generating}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Generate {getTotalBarcodeCount()} Barcodes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Print preview (hidden but used for printing) */}
      <div className="hidden">
        <div ref={printRef}>
          <div className={`barcode-grid ${labelSettings.layout}`}>
            {generatedBarcodes.map((barcode) => (
              <div key={barcode.id} className="barcode-item">
                {labelSettings.showBusinessName && (
                  <div className="business-name">
                    {labelSettings.businessName}
                  </div>
                )}
                
                {labelSettings.showName && (
                  <div className="product-name">
                    {barcode.product.productName}
                  </div>
                )}
                
                <div className="barcode-container">
                  <svg id={`barcode-${barcode.id}`}></svg>
                </div>
                
                {labelSettings.showPrice && (
                  <div className="product-price">
                    {formatCurrency(barcode.product.retailPrice || 0)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CSS for printing */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          body * {
            visibility: hidden;
          }
          #printRef, #printRef * {
            visibility: visible;
          }
          #printRef {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        
        .barcode-grid {
          page-break-inside: avoid;
          width: 100%;
        }
        
        .barcode-grid.30-per-page {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 0.1cm;
          padding: 0.5cm;
        }
        
        .barcode-grid.24-per-page {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 0.2cm;
          padding: 0.5cm;
        }
        
        .barcode-grid.20-per-page {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-gap: 0.2cm;
          padding: 0.5cm;
        }
        
        .barcode-grid.10-per-page {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-gap: 0.3cm;
          padding: 0.5cm;
        }
        
        .barcode-grid.2x1-roll {
          display: flex;
          flex-direction: column;
          gap: 0.1cm;
          padding: 0.5cm;
        }
        
        .barcode-item {
          padding: 0.2cm;
          text-align: center;
          page-break-inside: avoid;
          border: 1px solid #f0f0f0;
        }
        
        .business-name {
          font-size: 8px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .product-name {
          font-size: 9px;
          font-weight: bold;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .barcode-container {
          display: flex;
          justify-content: center;
          margin: 3px 0;
        }
        
        .product-price {
          font-size: 10px;
          font-weight: bold;
          margin-top: 2px;
        }
      `}</style>
    </div>
  )
}