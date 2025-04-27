"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Plus, Minus, ShoppingCart, X, User, Coffee, Shirt, Smartphone, CreditCard, Gift, Banknote, Percent, Layers, Tag } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"

export default function PosPage() {
  // State for products, categories, and brands from API
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeBrand, setActiveBrand] = useState("all")

  // State for cart/order management
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ id: 0, name: "Guest Customer" })
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const { getAuthToken } = useAuth()
  const searchInputRef = useRef(null)

  // Add these state variables to your POS page component
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    // Try to get stored preference from localStorage, default to 24 if not found
    if (typeof window !== 'undefined') {
      const storedValue = localStorage.getItem('posItemsPerPage');
      return storedValue ? parseInt(storedValue, 10) : 24;
    }
    return 24; // Default for POS view - higher than products page for more compact display
  })

  // Update the fetchData function to handle pagination properly
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = getAuthToken()
        if (!token) {
          throw new Error("Authentication token is missing")
        }

        // Fetch categories (unchanged)
        const categoriesResponse = await fetch("/api/proxy/api/v1/category", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!categoriesResponse.ok) {
          throw new Error(`Categories API error: ${categoriesResponse.status}`)
        }

        const categoriesData = await categoriesResponse.json()
        
        // Fetch brands (unchanged)
        const brandsResponse = await fetch("/api/proxy/api/v1/brand", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!brandsResponse.ok) {
          throw new Error(`Brands API error: ${brandsResponse.status}`)
        }

        const brandsData = await brandsResponse.json()
        
        // Fetch products with pagination parameters
        // Construct the API URL with pagination and filtering parameters
        let apiUrl = `/api/proxy/api/v1/product?page=${currentPage}&limit=${itemsPerPage}`;
        
        // Add filters if they exist
        if (activeCategory !== "all") {
          apiUrl += `&categoryId=${activeCategory}`;
        }
        
        if (activeBrand !== "all") {
          apiUrl += `&brandId=${activeBrand}`;
        }
        
        // Add search term if it exists
        if (searchTerm) {
          apiUrl += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const productsResponse = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!productsResponse.ok) {
          throw new Error(`Products API error: ${productsResponse.status}`)
        }

        const productsData = await productsResponse.json()

        // Process and set data
        if (categoriesData.success && categoriesData.data?.result) {
          setCategories(categoriesData.data.result)
        }

        if (brandsData.success && brandsData.data?.result) {
          setBrands(brandsData.data.result)
        }

        if (productsData.success && productsData.data?.result) {
          // Format product data for use in the POS
          const formattedProducts = productsData.data.result.map(product => ({
            id: product.productId,
            name: product.productName,
            price: product.retailPrice || 0,
            originalPrice: product.originalPrice || 0,
            categoryId: product.categoryId,
            categoryName: product.categoryName || "Uncategorized",
            brandId: product.brandId,
            brandName: product.brandName || "Unbranded",
            image: product.thumbnail || "/placeholder.svg",
            sku: product.sku || "",
            barcode: product.barcode || "",
            inStock: product.stockQuantity > 0
          }))
          setProducts(formattedProducts)
          
          // Set total items for pagination based on the API response structure
          if (productsData.data?.meta?.total) {
            setTotalItems(productsData.data.meta.total);
          } else if (productsData.data?.totalPage) {
            // If we have totalPage but not total items, calculate an estimate
            setTotalItems(productsData.data.totalPage * itemsPerPage);
          } else if (productsData.data?.result?.length) {
            // Last resort fallback
            setTotalItems(Math.max(productsData.data.result.length, itemsPerPage));
          } else {
            setTotalItems(0);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(`Failed to load data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, itemsPerPage, searchTerm, activeCategory, activeBrand])

  // Calculate total pages from totalItems
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setItemsPerPage(newValue);
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('posItemsPerPage', newValue.toString());
    }
    
    // Reset to first page when changing items per page
    setCurrentPage(1);
  }

  // Calculate indexes for "showing X to Y of Z" message
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Filter products based on search term, category, and brand
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
    
    const matchesCategory = activeCategory === "all" || 
      product.categoryId === parseInt(activeCategory)
    
    const matchesBrand = activeBrand === "all" || 
      product.brandId === parseInt(activeBrand)
    
    return matchesSearch && matchesCategory && matchesBrand
  })

  // Cart manipulation functions
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId))
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      ))
    }
  }

  const clearCart = () => {
    if (cart.length > 0 && window.confirm("Are you sure you want to clear the cart?")) {
      setCart([])
      setDiscount(0)
      setCashReceived("")
    }
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const taxAmount = (subtotal * tax) / 100
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal + taxAmount - discountAmount

  // Handle payment completion
  const processPayment = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Please add products before payment.")
      return
    }

    if (paymentMethod === "cash" && parseFloat(cashReceived) < total) {
      alert("Cash received must be greater than or equal to the total amount.")
      return
    }

    // Here you would typically send the transaction to your API
    alert(`Payment of ${total.toFixed(2)} processed via ${paymentMethod.toUpperCase()}!`)
    
    // Reset state
    setCart([])
    setDiscount(0)
    setTax(0)
    setCashReceived("")
    setShowPaymentModal(false)
    setCustomer({ id: 0, name: "Guest Customer" })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 h-[calc(100vh-8rem)]">
      {/* Left Panel - Product Catalog/Selection (4/7 of screen) */}
      <div className="col-span-1 lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
        {/* Search and Filter Area */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Search products or scan barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category and Brand Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {/* Category Dropdown */}
          <div className="relative w-48">
            <label htmlFor="categoryFilter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="categoryFilter"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId.toString()}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="relative w-48">
            <label htmlFor="brandFilter" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Brand
            </label>
            <select
              id="brandFilter"
              value={activeBrand}
              onChange={(e) => setActiveBrand(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand.brandId} value={brand.brandId.toString()}>
                  {brand.brandName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid - Update to make cards smaller and more compact */}
        {/* Replace the existing product grid around line ~280 */}
        <div className="flex flex-col overflow-y-auto">
          {loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500 text-center">
                <p className="mb-2">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 dark:text-gray-400">No products found. Try a different search or filter.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 mb-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`border rounded-lg p-1.5 cursor-pointer transition-all hover:shadow-md ${
                      product.inStock 
                      ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                      : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-70"
                    }`}
                  >
                    <div className="relative w-full h-16 mb-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain rounded-md"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <h3 className="text-xs font-medium text-gray-900 dark:text-white truncate">{product.name}</h3>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {formatCurrency(product.price)}
                      </p>
                      {!product.inStock && (
                        <span className="px-1 py-0.5 text-[10px] bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                          Out
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 mb-3 sm:mb-0 w-full sm:w-auto">
                  <div className="text-xs text-gray-700 dark:text-gray-300 w-full sm:w-auto text-center sm:text-left">
                    {products.length > 0 ? (
                      <>
                        Showing <span className="font-medium">{indexOfFirstItem}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(indexOfLastItem, totalItems)}
                        </span>{" "}
                        of <span className="font-medium">{totalItems}</span> products
                      </>
                    ) : (
                      "No products found"
                    )}
                  </div>
                  
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2 text-xs ml-3">
                    <label htmlFor="itemsPerPage" className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      Show:
                    </label>
                    <div className="relative">
                      <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="appearance-none bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full py-1 px-2 pr-6 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
                      >
                        <option value="24">24</option>
                        <option value="36">36</option>
                        <option value="48">48</option>
                        <option value="72">72</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500 dark:text-gray-400">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
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
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Order Summary/Cart (3/7 of screen) */}
      <div className="col-span-1 lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
        {/* Customer Info */}
        <div className="mb-4 flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Customer #{customer.id || "Guest"}</p>
            </div>
          </div>
          <button 
            className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Change
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto mb-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-30" />
              <p>Your cart is empty</p>
              <p className="text-xs mt-1">Add products from the catalog</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-700 mr-3 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md mr-2 overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            updateQuantity(item.id, val);
                          }
                        }}
                        className="w-10 py-1 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-x border-gray-300 dark:border-gray-600 text-sm"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="w-20 text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => updateQuantity(item.id, 0)}
                      className="ml-2 p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Subtotal:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Tax:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-12 px-1 py-0.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">%</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(taxAmount)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Discount:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-12 px-1 py-0.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white"
                />
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">%</span>
              </div>
              <span className="text-sm font-medium text-red-600 dark:text-red-400">-{formatCurrency(discountAmount)}</span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total:</span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Clear Cart
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Hold Sale
            </button>
          </div>
          
          {/* Payment Methods */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              onClick={() => {
                setPaymentMethod("cash")
                setShowPaymentModal(true)
              }}
              className={`p-2 flex flex-col items-center justify-center rounded-md text-xs ${
                paymentMethod === "cash" && showPaymentModal
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Banknote className="w-5 h-5 mb-1" />
              Cash
            </button>
            <button
              onClick={() => {
                setPaymentMethod("card")
                setShowPaymentModal(true)
              }}
              className={`p-2 flex flex-col items-center justify-center rounded-md text-xs ${
                paymentMethod === "card" && showPaymentModal
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <CreditCard className="w-5 h-5 mb-1" />
              Card
            </button>
            <button
              onClick={() => {
                setPaymentMethod("gift")
                setShowPaymentModal(true)
              }}
              className={`p-2 flex flex-col items-center justify-center rounded-md text-xs ${
                paymentMethod === "gift" && showPaymentModal
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Gift className="w-5 h-5 mb-1" />
              Gift Card
            </button>
            <button
              onClick={() => {
                setPaymentMethod("split")
                setShowPaymentModal(true)
              }}
              className={`p-2 flex flex-col items-center justify-center rounded-md text-xs ${
                paymentMethod === "split" && showPaymentModal
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Layers className="w-5 h-5 mb-1" />
              Split Pay
            </button>
          </div>
          
          {/* Pay Button */}
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={cart.length === 0}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {cart.length === 0 ? (
              "Add items to cart"
            ) : (
              <>Pay {formatCurrency(total)}</>
            )}
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {paymentMethod === "cash" ? "Cash Payment" : 
                 paymentMethod === "card" ? "Card Payment" :
                 paymentMethod === "gift" ? "Gift Card Payment" : "Split Payment"}
              </h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Due: {formatCurrency(total)}
              </p>
              
              {paymentMethod === "cash" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cash Received
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={total}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter amount"
                  />
                  
                  {parseFloat(cashReceived) >= total && (
                    <div className="mt-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Change Due:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(parseFloat(cashReceived) - total)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {paymentMethod === "card" && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Please swipe, tap, or insert the customer's card in the reader to process the payment.
                  </p>
                  {/* Card payment UI would typically connect to a payment terminal or service */}
                </div>
              )}
              
              {paymentMethod === "gift" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gift Card Number
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter gift card number"
                  />
                </div>
              )}
              
              {paymentMethod === "split" && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Split payment between multiple methods
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Banknote className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Cash</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="Amount"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Card</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="Amount"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Gift className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Gift Card</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="Amount"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-sm"
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}