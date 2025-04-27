"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar, X, Save, Plus, Loader2, ArrowLeft, Search, ShoppingCart, Trash2 } from "lucide-react" // Added icons
import Image from "next/image" // For product images
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function AddPurchasePage() {
  // --- State Variables ---

  // Data fetched from API
  const [suppliers, setSuppliers] = useState([])
  const [apiProducts, setApiProducts] = useState([]) // Products for the left panel catalog

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true) // Loading suppliers + initial products
  const [isProductLoading, setIsProductLoading] = useState(false) // Loading products for pagination/search
  const [isFetchingDetails, setIsFetchingDetails] = useState(false) // Loading purchase details for edit
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Purchase form state
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    supplierId: "",
    purchaseDate: new Date(),
    additionalCharge: 0,
    overallDiscount: 0,
    remarks: "",
    items: [] // Structure will match API when sending
  })

  // Product Catalog (Left Panel) State
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(16) // Fewer items per page for purchase context might be better
  const [totalPages, setTotalPages] = useState(1)

  // Refs
  const searchInputRef = useRef(null)
  const rightPanelRef = useRef(null) // To potentially scroll when item added

  // Context & Navigation
  const { getAuthToken } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const purchaseId = searchParams.get("id")

  // --- Effects ---

  // Initial data fetch (Suppliers) and Edit Mode Check
  useEffect(() => {
    setIsInitialLoading(true)
    fetchSuppliers()
      .catch(err => {
        console.error("Error fetching initial supplier data:", err)
        toast.error("Failed to load supplier data.")
      })
      .finally(() => {
        // We set initial loading false after product fetch completes
      })

    if (purchaseId) {
      setIsEditMode(true)
      fetchPurchaseDetails(purchaseId) // Fetch details for edit mode
    } else {
        // Reset form if navigating from edit mode to add mode without full page reload
        resetFormState();
        setIsEditMode(false);
        // Fetch initial products only if not in edit mode (edit mode fetches products later)
        fetchApiProducts(1, itemsPerPage, ""); // Fetch first page
    }
  }, [purchaseId]) // Rerun only when purchaseId changes

  // Fetch Products for Catalog whenever page, itemsPerPage, or search changes
  useEffect(() => {
    // Don't fetch products initially if we are in edit mode and still fetching details
    if (!isEditMode || (isEditMode && !isFetchingDetails)) {
        fetchApiProducts(currentPage, itemsPerPage, searchTerm)
    }
  }, [currentPage, itemsPerPage, searchTerm, isEditMode, isFetchingDetails]) // Dependencies for product catalog


  // --- Data Fetching ---

  const fetchPurchaseDetails = async (id) => {
    setIsFetchingDetails(true)
    setIsInitialLoading(false) // Can stop initial load now
    try {
      const token = getAuthToken()
      if (!token) throw new Error("Authentication token is missing")
      const response = await fetch(`/api/proxy/api/v1/purchase/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      if (data.success && data.data) {
        const purchase = data.data
        // Map purchaseChildren to formData.items
        const itemsList = (purchase.purchaseChildren || []).map(item => ({
          productId: item.productId,
          // Fetch product details (name, image etc.) to display nicely in the right panel list
          // We need to fetch product details separately or assume they are already loaded in apiProducts
          // For simplicity, let's just store basic info for now. A better approach might merge info later.
          productName: item.productName || `Product ID: ${item.productId}`, // Store name if available
          image: item.product?.thumbnail || "/placeholder.svg", // Store image if available
          variantId: item.variantId || 0,
          purchasePrice: item.purchasePrice || 0.01,
          conversionRate: item.conversionRate || 1,
          receiveQty: item.receiveQty || 1,
          discount: item.discount || 0,
          bonusQty: item.bonusQty || 0,
          wSalePrice: item.wSalePrice || 0,
          retailPrice: item.retailPrice || 0,
          subtotal: calculateLineSubtotal(item.purchasePrice, item.receiveQty, item.discount)
        }))

        setFormData({
          purchaseId: purchase.purchaseId,
          supplierId: purchase.supplierId?.toString() || "",
          purchaseDate: new Date(purchase.purchaseDate),
          purchaseOrderNo: purchase.purchaseOrderNo || "",
          invoiceNo: purchase.invoiceNo || "",
          refNo: purchase.refNo || "",
          additionalCharge: purchase.additionalCharge || 0,
          overallDiscount: purchase.overallDiscount || 0,
          remarks: purchase.remarks || "",
          status: purchase.status !== undefined ? purchase.status : true,
          items: itemsList
        })
        // After setting items, fetch the current page of products for the left panel
        fetchApiProducts(currentPage, itemsPerPage, searchTerm);

      } else {
        toast.error("Failed to fetch purchase details: " + (data.message || "Unknown error"))
        router.push("/admin/purchase"); // Redirect if fetch fails
      }
    } catch (err) {
      console.error("Fetch purchase details error:", err)
      toast.error("Failed to fetch purchase details: " + err.message)
      router.push("/admin/purchase");
    } finally {
      setIsFetchingDetails(false)
    }
  }

  const fetchSuppliers = async () => {
    // setLoading(true) // Handled by isInitialLoading
    try {
      const token = getAuthToken()
      if (!token) throw new Error("Authentication token is missing")
      const response = await fetch(`/api/proxy/api/v1/vendors`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      if (data.success && data.data?.result) {
        setSuppliers(data.data.result)
      } else {
        setSuppliers([])
        throw new Error("Failed to fetch suppliers or no suppliers found.")
      }
    } catch (err) {
      console.error("Fetch suppliers error:", err)
      toast.error("Error loading suppliers: " + err.message)
      // Don't stop initial loading here, let it finish in the calling useEffect
    }
     // setLoading(false)
  }

  // Fetch products for the LEFT PANEL CATALOG
 const fetchApiProducts = async (page, limit, search = "") => {
    setIsProductLoading(true)
    try {
      const token = getAuthToken()
      if (!token) throw new Error("Authentication token is missing")

      let apiUrl = `/api/proxy/api/v1/product?page=${page}&limit=${limit}`
      if (search) {
        apiUrl += `&search=${encodeURIComponent(search)}`
      }
      // Add other filters like category/brand if needed later

      const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
          const errorText = await response.text();
           try {
               const errorData = JSON.parse(errorText);
               throw new Error(errorData.message || `Products API error: ${response.status}`);
           } catch (e) {
               throw new Error(`Products API error: ${response.status}. ${errorText}`);
           }
      }

      const data = await response.json()

      if (data.success && data.data) {
          const formattedProducts = (data.data.result || []).map(p => ({
              productId: p.productId,
              name: p.productName,
              sku: p.sku || "N/A",
              barcode: p.barcode || "N/A",
              image: p.thumbnail || "/placeholder.svg",
              // Include prices needed for default purchase price calculation
              retailPrice: p.retailPrice || 0,
              originalPrice: p.originalPrice || 0, // This seems like the base price
              // Add other relevant details if needed for display
          }));
          setApiProducts(formattedProducts)

        // Set total items and calculate total pages
          const total = data.data.meta?.total ?? data.data.totalCount ?? formattedProducts.length ?? 0; // Adjust based on your API response structure
          setTotalItems(total);
          setTotalPages(Math.max(1, Math.ceil(total / limit)));

      } else {
          console.warn("Failed to fetch products or empty result", data)
          setApiProducts([])
          setTotalItems(0)
          setTotalPages(1)
          // Potentially toast an error if data.success is false but response was ok
          if (!data.success) {
              toast.error(data.message || "Failed to fetch products.")
          }
      }
    } catch (err) {
      console.error("Fetch API products error:", err)
      toast.error("Error loading products: " + err.message)
      setApiProducts([])
      setTotalItems(0)
      setTotalPages(1)
    } finally {
      setIsProductLoading(false)
      setIsInitialLoading(false) // Ensure initial loading is false after first product fetch
    }
  }


  // --- Form Handlers (Right Panel) ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked :
              type === "number" ? parseFloat(value) || 0 : value
    }))
  }

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, purchaseDate: date }))
  }

  // Handles changes within the selected items list (Right Panel)
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items]
    let item = updatedItems[index]

    // Parse numeric fields
    if (["purchasePrice", "receiveQty", "bonusQty", "conversionRate", "wSalePrice", "retailPrice"].includes(field)) {
      let numValue = parseFloat(value);
      if (isNaN(numValue)) numValue = 0; // Default to 0 if invalid

      // Apply constraints
      if (field === "purchasePrice" && numValue <= 0) numValue = 0.01;
      if (field === "receiveQty" && numValue <= 0) numValue = 1;
      if (field === "conversionRate" && numValue <= 0) numValue = 1;
      if (["bonusQty", "wSalePrice", "retailPrice"].includes(field) && numValue < 0) numValue = 0;

      item[field] = numValue;
    } else {
      item[field] = value; // For string fields
    }

    // Update UI-only calculated subtotal if needed
    if (["purchasePrice", "receiveQty"].includes(field)) {
      item._subtotal = calculateLineSubtotal(item.purchasePrice, item.receiveQty, 0)
    }

    updatedItems[index] = item
    setFormData(prev => ({ ...prev, items: updatedItems }))
  }

  // Adds a product from the Left Panel Catalog to the Right Panel Purchase List
  const addProductToPurchase = (product) => {
    // Check if item already exists in the purchase list
    const existingItemIndex = formData.items.findIndex(item => item.productId === product.productId)

    if (existingItemIndex !== -1) {
      // If exists, maybe increment quantity or just notify
      toast.info(`${product.name} is already in the purchase list. Adjust quantity there.`)
      // Highlight the existing row (code unchanged)
      const rowElement = document.getElementById(`purchase-item-row-${existingItemIndex}`);
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        rowElement.classList.add('flash-highlight');
        setTimeout(() => rowElement.classList.remove('flash-highlight'), 1500);
      }
      return
    }

    // Define a default purchase price
    const basePrice = product.originalPrice || product.retailPrice || 0.01;
    const defaultPurchasePrice = basePrice > 0.01 ? parseFloat((basePrice * 0.7).toFixed(2)) : 0.01;

    // Create an item with only the fields needed by the API
    const newItem = {
      // API required fields
      productId: product.productId,
      variantId: 0,
      purchasePrice: defaultPurchasePrice,
      conversionRate: 1,
      receiveQty: 1,
      bonusQty: 0,
      wSalePrice: parseFloat((defaultPurchasePrice * 1.2).toFixed(2)),
      retailPrice: parseFloat((defaultPurchasePrice * 1.4).toFixed(2)),
      // UI-only fields (will be removed before sending to API)
      _productName: product.name, // Prefix with _ to indicate UI-only
      _image: product.image,      // Prefix with _ to indicate UI-only
      _subtotal: calculateLineSubtotal(defaultPurchasePrice, 1) // For UI display only
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    // Scroll right panel to bottom
    if (rightPanelRef.current) {
      setTimeout(() => {
        rightPanelRef.current.scrollTop = rightPanelRef.current.scrollHeight;
      }, 0);
    }
  }

  // Removes an item from the Right Panel Purchase List
  const removeItemFromPurchase = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  // Clear all items from purchase list
  const clearPurchaseItems = () => {
      if (formData.items.length > 0 && window.confirm("Are you sure you want to remove all items from this purchase?")) {
          setFormData(prev => ({ ...prev, items: [] }));
      }
  }

  // --- Calculation & Validation ---

  const calculateLineSubtotal = (price, qty) => {
    // Simplified to match API requirements - no discount parameter
    const p = parseFloat(price) || 0
    const q = parseFloat(qty) || 0
    return parseFloat((p * q).toFixed(2))
  }

  const calculateTotals = () => {
    const itemsSubtotal = formData.items.reduce((total, item) => {
      return total + calculateLineSubtotal(item.purchasePrice, item.receiveQty)
    }, 0)
    
    const overallDiscount = parseFloat(formData.overallDiscount) || 0
    const additionalCharge = parseFloat(formData.additionalCharge) || 0
    const grandTotal = itemsSubtotal - overallDiscount + additionalCharge

    return {
      itemsSubtotal: itemsSubtotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }
  }

  const validateForm = () => {
    const errors = []
    // Only validate fields that are in the API structure
    if (!formData.supplierId) errors.push("Please select a supplier.")
    if (formData.items.length === 0) {
      errors.push("Purchase must include at least one item.")
    } else {
      formData.items.forEach((item, index) => {
        // Only validate required fields in the API structure
        if (!item.purchasePrice || item.purchasePrice <= 0) 
          errors.push(`Price for ${item._productName || `item ${index + 1}`} must be > 0.`)
        if (!item.receiveQty || item.receiveQty <= 0) 
          errors.push(`Quantity for ${item._productName || `item ${index + 1}`} must be > 0.`)
      })
    }
    return errors
  }

  // --- Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join("\n"))
      return
    }

    setIsSubmitting(true)
    try {
      const token = getAuthToken()
      if (!token) throw new Error("Authentication token is missing")

      // Prepare payload items with only the required fields for the API
      const processedItems = formData.items.map(item => ({
        productId: parseInt(item.productId, 10),
        variantId: parseInt(item.variantId) || 0,
        purchasePrice: Math.max(0.01, parseFloat(item.purchasePrice) || 0.01),
        conversionRate: Math.max(1, parseFloat(item.conversionRate) || 1),
        receiveQty: Math.max(1, parseFloat(item.receiveQty) || 1),
        bonusQty: Math.max(0, parseFloat(item.bonusQty) || 0),
        wSalePrice: Math.max(0, parseFloat(item.wSalePrice) || 0),
        retailPrice: Math.max(0, parseFloat(item.retailPrice) || 0)
      }));

      const payload = {
        supplierId: parseInt(formData.supplierId, 10),
        purchaseDate: formData.purchaseDate.toISOString(),
        additionalCharge: parseFloat(formData.additionalCharge) || 0,
        overallDiscount: parseFloat(formData.overallDiscount) || 0,
        remarks: formData.remarks || "",
        items: processedItems
      }

      // For edit mode, include the purchaseId
      if (isEditMode) {
        payload.purchaseId = parseInt(formData.purchaseId, 10)
      }

      const url = isEditMode ? `/api/proxy/api/v1/purchase/${formData.purchaseId}` : "/api/proxy/api/v1/purchase"
      const method = isEditMode ? "PUT" : "POST"

      console.log(`${method} request to ${url} with payload:`, JSON.stringify(payload, null, 2))

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const responseBody = await response.text()
      console.log("API Response Status:", response.status)
      console.log("API Response Body:", responseBody)

      let data
      try { data = JSON.parse(responseBody) } catch (parseError) {
           if (!response.ok) throw new Error(`API error: ${response.status}. Response not valid JSON.`);
           console.warn("API response OK but not valid JSON.");
           data = { success: true, message: "Operation successful, but response format was unexpected." };
      }

      if (!response.ok) throw new Error(data?.message || `API Error: ${response.status}`);
      if (!data.success) throw new Error(data.message || `Failed to ${isEditMode ? "update" : "add"} purchase.`);

      toast.success(`Purchase ${isEditMode ? "updated" : "added"} successfully!`)
      setTimeout(() => router.push("/admin/purchase"), 1000)

    } catch (err) {
      console.error(`${isEditMode ? "Update" : "Add"} purchase error:`, err)
      toast.error(`Error: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Helper Functions ---
  const resetFormState = () => {
    setFormData({
        supplierId: "", 
        purchaseDate: new Date(), 
        additionalCharge: 0, 
        overallDiscount: 0,
        remarks: "", 
        items: []
    });
  };

   // Format currency (example)
   const formatCurrency = (amount) => {
       return new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
       // Or use a library like Dinero.js for more robust currency handling
   }

   // Pagination Handlers
   const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Items per page handler (optional, you can fix it)
    const handleItemsPerPageChange = (e) => {
        const newLimit = parseInt(e.target.value, 10);
        setItemsPerPage(newLimit);
        setCurrentPage(1); // Reset to first page
    };

  // --- Render Logic ---

  if (isInitialLoading || (isEditMode && isFetchingDetails)) {
    return (
      <div className="flex justify-center items-center p-10 h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mr-3" />
        <span className="text-lg text-gray-600 dark:text-gray-300">
            {isEditMode && isFetchingDetails ? "Loading purchase details..." : "Loading..."}
        </span>
      </div>
    )
  }

  const { itemsSubtotal, grandTotal } = calculateTotals()
  const inputBaseClass = "block w-full text-sm rounded-md shadow-sm border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
  const inputPaddingClass = "py-1.5 px-3"

  // Calculate indexes for "showing X to Y of Z" message
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 h-[calc(100vh-5rem)] p-4 bg-gray-100 dark:bg-gray-900">
      {/* Left Panel - Product Catalog */}
      <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
         {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Products</h2>
            <Link
              href="/admin/purchase"
              className="flex items-center px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Purchase List
            </Link>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className={`${inputBaseClass} ${inputPaddingClass} pl-10`}
              placeholder="Search products by name, SKU, barcode..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1) // Reset page on new search
              }}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-grow overflow-y-auto mb-4 relative">
          {isProductLoading && (
            <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          )}
          {apiProducts.length === 0 && !isProductLoading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {apiProducts.map((product) => (
                <div
                  key={product.productId}
                  onClick={() => addProductToPurchase(product)}
                  className="border rounded-lg p-2 cursor-pointer transition-all hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 flex flex-col items-center text-center"
                  title={`Add ${product.name} to purchase`}
                >
                  <div className="relative w-16 h-16 mb-2 bg-gray-100 dark:bg-gray-600 rounded-md overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                      onError={(e) => { e.target.src = "/placeholder.svg"; }}
                    />
                  </div>
                  <h3 className="text-xs font-medium text-gray-800 dark:text-white leading-tight line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                   {/* Optional: Add button instead of clicking whole card */}
                   {/* <button className="mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded hover:bg-blue-200">Add</button> */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                {totalItems > 0 ? (
                    <>
                        Showing <span className="font-medium">{indexOfFirstItem}</span> to{" "}
                        <span className="font-medium">{indexOfLastItem}</span> of{" "}
                        <span className="font-medium">{totalItems}</span> products
                    </>
                ) : (
                    "No products found"
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center space-x-1">
                     <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1 || isProductLoading}
                        className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                    > First </button>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isProductLoading}
                        className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                    > Prev </button>
                    <span className="text-xs px-2">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isProductLoading}
                         className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                    > Next </button>
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || isProductLoading}
                         className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                    > Last </button>
                </div>
            )}
        </div>
      </div>

      {/* Right Panel - Purchase Details & Items List */}
      <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
        {/* Purchase Form Header */}
         <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            {isEditMode ? "Edit Purchase Details" : "New Purchase Details"}
        </h2>

        {/* Form Inputs Area (Scrollable) */}
        <div className="overflow-y-auto pr-2 flex-grow" ref={rightPanelRef}>
            {/* Supplier, Date, Invoice#, PO#, Ref# */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label htmlFor="supplierId" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier<span className="text-red-500">*</span>
                    </label>
                    <select
                        id="supplierId" name="supplierId" value={formData.supplierId}
                        onChange={handleInputChange} required
                        className={`${inputBaseClass} ${inputPaddingClass}`}
                    >
                        <option value="">Select supplier</option>
                        {suppliers.map((s) => <option key={s.vendorId} value={s.vendorId}>{s.vendorName}</option>)}
                        {suppliers.length === 0 && <option disabled>Loading...</option>}
                    </select>
                </div>
                 <div>
                    <label htmlFor="purchaseDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Date<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <DatePicker
                            id="purchaseDate" selected={formData.purchaseDate} onChange={handleDateChange}
                            dateFormat="yyyy-MM-dd" className={`${inputBaseClass} ${inputPaddingClass} pl-9`}
                        />
                    </div>
                </div>
                {/* Status Checkbox */}
                <div className="flex items-center pt-5">
                    <input
                        type="checkbox" id="status" name="status" checked={formData.status}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="status" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Purchase Active</label>
                </div>
            </div>

             {/* Purchase Items List ("Cart") */}
            <div className="mb-4">
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-medium text-gray-800 dark:text-white">Items in Purchase ({formData.items.length})</h3>
                    <button
                        type="button"
                        onClick={clearPurchaseItems}
                        disabled={formData.items.length === 0 || isSubmitting}
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 flex items-center"
                    >
                        <Trash2 className="w-3 h-3 mr-1" /> Clear All
                    </button>
                </div>

                {formData.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                        <ShoppingCart className="w-8 h-8 mb-1 opacity-50" />
                        <p className="text-sm">No items added yet.</p>
                        <p className="text-xs mt-1">Select products from the left panel.</p>
                    </div>
                ) : (
                    <div className="border border-gray-200 dark:border-gray-600 rounded-md divide-y divide-gray-200 dark:divide-gray-600">
                       {/* Table Header (Optional but good for clarity) */}
                        <div className="hidden sm:grid grid-cols-12 gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                            <div className="col-span-4">Product</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">Discount</div>
                            <div className="col-span-1 text-right">Total</div>
                            <div className="col-span-1 text-center"></div> {/* Action */}
                        </div>
                        {/* Item Rows */}
                        {formData.items.map((item, index) => (
                            <div key={item.productId + '-' + index} id={`purchase-item-row-${index}`} className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-3 py-2 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                {/* Product Info */}
                                <div className="col-span-1 sm:col-span-4 flex items-center">
                                     <div className="relative w-8 h-8 mr-2 bg-gray-100 dark:bg-gray-600 rounded flex-shrink-0 overflow-hidden">
                                        <Image src={item._image || '/placeholder.svg'} alt={item._productName} fill sizes="32px" className="object-contain"/>
                                    </div>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">{item._productName}</span>
                                </div>
                                {/* Price Input */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="sm:hidden text-xs text-gray-500">Price:</label>
                                    <input type="number" value={item.purchasePrice} onChange={(e) => handleItemChange(index, "purchasePrice", e.target.value)}
                                        min="0.01" step="0.01" required className={`${inputBaseClass} py-1 px-2 text-xs text-right`} />
                                </div>
                                {/* Qty Input */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="sm:hidden text-xs text-gray-500">Qty:</label>
                                    <input type="number" value={item.receiveQty} onChange={(e) => handleItemChange(index, "receiveQty", e.target.value)}
                                        min="1" step="1" required className={`${inputBaseClass} py-1 px-2 text-xs text-center`} />
                                </div>
                                {/* Bonus Input (instead of discount) */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="sm:hidden text-xs text-gray-500">Bonus Qty:</label>
                                    <input type="number" value={item.bonusQty} onChange={(e) => handleItemChange(index, "bonusQty", e.target.value)}
                                        min="0" step="1" className={`${inputBaseClass} py-1 px-2 text-xs text-right`} />
                                </div>
                                {/* Subtotal Display */}
                                <div className="col-span-1 sm:col-span-1 text-right">
                                    <label className="sm:hidden text-xs text-gray-500">Subtotal:</label>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatCurrency(item._subtotal)}</span>
                                </div>
                                {/* Remove Button */}
                                <div className="col-span-1 sm:col-span-1 text-center">
                                    <button type="button" onClick={() => removeItemFromPurchase(index)}
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Remove Item">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Remarks */}
             <div className="mb-4">
                <label htmlFor="remarks" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Remarks
                </label>
                <textarea
                    id="remarks" name="remarks" value={formData.remarks} onChange={handleInputChange}
                    rows="3" className={`${inputBaseClass} ${inputPaddingClass}`}
                    placeholder="Optional notes about this purchase..."
                ></textarea>
            </div>

        </div> {/* End of Scrollable Area */}

        {/* Totals & Actions (Fixed at Bottom) */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-4 rounded-b-lg -mx-4 -mb-4">
           <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Items Subtotal:</span>
                    <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(itemsSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <label htmlFor="overallDiscount" className="text-gray-600 dark:text-gray-300">Overall Discount (-):</label>
                    <input type="number" id="overallDiscount" name="overallDiscount" value={formData.overallDiscount} onChange={handleInputChange}
                           min="0" step="0.01" className={`${inputBaseClass} py-1 px-2 text-xs text-right w-24`} />
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <label htmlFor="additionalCharge" className="text-gray-600 dark:text-gray-300">Additional Charges (+):</label>
                    <input type="number" id="additionalCharge" name="additionalCharge" value={formData.additionalCharge} onChange={handleInputChange}
                           min="0" step="0.01" className={`${inputBaseClass} py-1 px-2 text-xs text-right w-24`} />
                </div>
                 <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-300 dark:border-gray-600 mt-2">
                    <span className="text-gray-900 dark:text-white">Grand Total:</span>
                    <span className="text-blue-600 dark:text-blue-400">{formatCurrency(grandTotal)}</span>
                </div>
           </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
                 <Link
                    href="/admin/purchase"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                 >
                    Cancel
                 </Link>
                <button
                    type="button" // Change to type="button" and trigger submit via onClick or form's onSubmit
                    onClick={handleSubmit} // Trigger submit
                    disabled={isSubmitting || formData.items.length === 0}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? (
                    <> <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {isEditMode ? "Updating..." : "Saving..."} </>
                    ) : (
                    <> <Save className="w-4 h-4 mr-2" /> {isEditMode ? "Update Purchase" : "Save Purchase"} </>
                    )}
                </button>
            </div>
        </div>
      </div>

       {/* Global Styles for Flash Highlight */}
      <style jsx global>{`
        .flash-highlight {
          animation: flash-bg 1.5s ease-out;
        }
        @keyframes flash-bg {
          0% { background-color: rgba(59, 130, 246, 0.3); } /* light blue transparent */
          100% { background-color: transparent; }
        }
        .dark .flash-highlight {
            animation: flash-bg-dark 1.5s ease-out;
        }
         @keyframes flash-bg-dark {
          0% { background-color: rgba(59, 130, 246, 0.4); } /* slightly more opaque blue */
          100% { background-color: transparent; }
        }
      `}</style>

    </div>
  )
}