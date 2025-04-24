"use client"

import { useState, useEffect } from "react"
import { Calendar, X, Save, Plus, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { use } from "react" // For fixing params issue

export default function AddPurchasePage() {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    purchaseId: 0,
    supplierId: "",
    purchaseDate: new Date(),
    purchaseOrderNo: "",
    invoiceNo: "",
    refNo: "",
    additionalCharge: 0,
    overallDiscount: 0,
    remarks: "",
    status: true,
    items: [] // Changed from purchaseChildren to items to match API
  })
  
  const { getAuthToken } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const purchaseId = searchParams.get("id")

  useEffect(() => {
    fetchSuppliers()
    fetchProducts()
    
    if (purchaseId) {
      setIsEditMode(true)
      fetchPurchaseDetails(purchaseId)
    }
  }, [purchaseId])
  
  // Fetch purchase details for editing
  const fetchPurchaseDetails = async (id) => {
    setLoading(true)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      const response = await fetch(`/api/proxy/api/purchase/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        const purchase = data.data
        
        // Convert from old to new structure
        let itemsList = []
        if (Array.isArray(purchase.purchaseChildren)) {
          itemsList = purchase.purchaseChildren.map(item => ({
            productId: item.productId,
            variantId: item.variantId || 0,
            purchasePrice: item.purchasePrice || 0,
            conversionRate: item.conversionRate || 1,
            receiveQty: item.receiveQty || 0,
            discount: item.discount || 0,
            bonusQty: item.bonusQty || 0,
            wSalePrice: item.wSalePrice || 0,
            retailPrice: item.retailPrice || 0,
            // Keep additional fields for UI functionality
            productName: item.productName || "",
            subtotal: item.subtotal || 0
          }))
        }
        
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
      } else {
        toast.error("Failed to fetch purchase details")
      }
    } catch (err) {
      console.error("Fetch purchase details error:", err)
      toast.error("Failed to fetch purchase details: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch suppliers for dropdown
  const fetchSuppliers = async () => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      const response = await fetch(`/api/proxy/api/v1/vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data && Array.isArray(data.data.result)) {
        setSuppliers(data.data.result)
      } else {
        console.warn("Failed to fetch suppliers or empty result", data)
        setSuppliers([])
      }
    } catch (err) {
      console.error("Fetch suppliers error:", err)
    }
  }

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      const response = await fetch(`/api/proxy/api/v1/product`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data && Array.isArray(data.data.result)) {
        setProducts(data.data.result)
      } else {
        console.warn("Failed to fetch products or empty result", data)
        setProducts([])
      }
    } catch (err) {
      console.error("Fetch products error:", err)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : 
              type === "number" ? parseFloat(value) || 0 : value
    })
  }

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      purchaseDate: date
    })
  }

  // Handle adding a new product line item
  const addProductLine = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: "",
          variantId: 0,
          purchasePrice: 0,
          conversionRate: 1,
          receiveQty: 1,
          discount: 0,
          bonusQty: 0,
          wSalePrice: 0,
          retailPrice: 0,
          // UI display fields
          productName: "",
          subtotal: 0
        }
      ]
    })
  }

  // Handle removing a product line item
  const removeProductLine = (index) => {
    const updatedLines = [...formData.items]
    updatedLines.splice(index, 1)
    
    setFormData({
      ...formData,
      items: updatedLines
    })
  }

  // Handle changes to a product line item
  const handleProductLineChange = (index, field, value) => {
    const updatedLines = [...formData.items]
    
    // If this is a product selection, get the product details
    if (field === "productId") {
      const productId = parseInt(value, 10)
      const selectedProduct = products.find(p => p.productId === productId)
      
      if (selectedProduct) {
        // Keep existing values that shouldn't be replaced
        const existingQty = updatedLines[index].receiveQty || 1
        const existingDiscount = updatedLines[index].discount || 0
        
        // Ensure purchase price is never zero or negative
        const defaultPrice = selectedProduct.originalPrice ? (selectedProduct.originalPrice * 0.7) : 1
        
        updatedLines[index] = {
          ...updatedLines[index],
          productId,
          productName: selectedProduct.productName || "Unknown Product",
          
          // Ensure purchase price is always valid (never zero)
          purchasePrice: defaultPrice,
          retailPrice: selectedProduct.originalPrice || defaultPrice * 1.4,
          wSalePrice: selectedProduct.originalPrice ? (selectedProduct.originalPrice * 0.9) : defaultPrice * 1.2,
          
          // Keep existing values for quantity and discount
          receiveQty: existingQty,
          discount: existingDiscount,
          
          // Use the main conversion rate
          conversionRate: 1
        }
        
        // Recalculate all derived values
        recalculateProductLine(updatedLines, index)
      }
    } else {
      // For other field changes, parse numbers properly
      if (field === "purchasePrice") {
        // Ensure price is never zero or empty
        const parsedValue = parseFloat(value)
        updatedLines[index][field] = (parsedValue && parsedValue > 0) ? parsedValue : 0.01
      } else if (field === "receiveQty" || field === "discount") {
        updatedLines[index][field] = value === "" ? 0 : parseFloat(value)
      } else {
        updatedLines[index][field] = value
      }
      
      // Recalculate values after field change
      recalculateProductLine(updatedLines, index)
    }
    
    setFormData({
      ...formData,
      items: updatedLines
    })
  }

  // Recalculate subtotal for a product line
  const recalculateProductLine = (lines, index) => {
    const line = lines[index]
    
    // Ensure we're working with numbers
    const purchasePrice = parseFloat(line.purchasePrice) || 0
    const receiveQty = parseFloat(line.receiveQty) || 0
    const discount = parseFloat(line.discount) || 0
    
    // Calculate subtotal (this is just for UI - API doesn't need it)
    const receiveAmt = receiveQty * purchasePrice
    line.subtotal = receiveAmt - discount
    
    // Round for display
    line.subtotal = parseFloat(line.subtotal.toFixed(2))
  }

  // Calculate total purchase amount
  const calculateTotalAmount = () => {
    const subtotal = formData.items.reduce((total, line) => {
      const price = parseFloat(line.purchasePrice) || 0
      const qty = parseFloat(line.receiveQty) || 0
      const discount = parseFloat(line.discount) || 0
      return total + ((price * qty) - discount)
    }, 0)
    
    const afterDiscount = subtotal - (formData.overallDiscount || 0)
    const total = afterDiscount + (formData.additionalCharge || 0)
    
    return {
      subtotal: subtotal.toFixed(2),
      afterDiscount: afterDiscount.toFixed(2),
      total: total.toFixed(2)
    }
  }

  // Validate the form data
  const validateForm = () => {
    const errors = []
    
    if (!formData.invoiceNo?.trim()) {
      errors.push("Invoice Number is required")
    }
    
    if (!formData.supplierId) {
      errors.push("Please select a supplier")
    }
    
    if (formData.items.length === 0) {
      errors.push("Please add at least one product")
    } else {
      // Check each product line for required data
      formData.items.forEach((product, index) => {
        if (!product.productId) {
          errors.push(`Select a product for line ${index + 1}`)
        }
        
        // Check for valid quantity
        if (!product.receiveQty || product.receiveQty <= 0) {
          errors.push(`Quantity for ${product.productName || `line ${index + 1}`} must be greater than 0`)
        }
        
        // Strict price validation
        if (!product.purchasePrice || product.purchasePrice <= 0) {
          errors.push(`Price for ${product.productName || `line ${index + 1}`} must be greater than 0`)
        }
      })
    }
    
    return errors
  }

  // Handle form submission for both add and edit
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate the form
    const errors = validateForm()
    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      // Ensure all items have valid pricing before submitting
      const processedItems = formData.items.map(item => {
        // Ensure we never send zero or negative prices to the API
        const purchasePrice = parseFloat(item.purchasePrice)
        const safePrice = purchasePrice > 0 ? purchasePrice : 0.01
        
        return {
          productId: parseInt(item.productId, 10),
          variantId: parseInt(item.variantId) || 0,
          purchasePrice: safePrice,
          conversionRate: parseFloat(item.conversionRate) || 1,
          receiveQty: parseFloat(item.receiveQty) || 1, // Default to 1 if zero
          discount: parseFloat(item.discount) || 0,
          bonusQty: parseFloat(item.bonusQty) || 0,
          wSalePrice: parseFloat(item.wSalePrice) || (safePrice * 1.2),
          retailPrice: parseFloat(item.retailPrice) || (safePrice * 1.4)
        }
      })
      
      // Create payload with new API structure
      const payload = {
        purchaseId: isEditMode ? parseInt(formData.purchaseId, 10) : 0,
        supplierId: parseInt(formData.supplierId, 10),
        purchaseDate: formData.purchaseDate.toISOString(),
        purchaseOrderNo: formData.purchaseOrderNo || "",
        invoiceNo: formData.invoiceNo,
        refNo: formData.refNo || "",
        additionalCharge: parseFloat(formData.additionalCharge) || 0,
        overallDiscount: parseFloat(formData.overallDiscount) || 0,
        remarks: formData.remarks || "",
        status: formData.status,
        // Use the processed items with validated prices
        items: processedItems
      }
      
      console.log(`${isEditMode ? "Updating" : "Adding"} purchase with payload:`, payload)
      
      // Determine URL and method based on edit or add
      const url = isEditMode 
        ? `/api/proxy/api/purchase/${formData.purchaseId}`
        : "/api/proxy/api/purchase"
      const method = isEditMode ? "PUT" : "POST"
      
      // Send the API request with improved error handling
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      // Check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `API error: ${response.status}`
        
        try {
          // Try to parse as JSON to get more detailed error
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // If it's not valid JSON, use the raw text
          console.error("Error response not in JSON format:", errorText)
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log(`${isEditMode ? "Update" : "Add"} purchase response:`, data)
      
      if (data.success) {
        toast.success(`Purchase ${isEditMode ? "updated" : "added"} successfully!`)
        
        // Delay the redirect slightly to ensure the toast is visible
        setTimeout(() => {
          router.push("/admin/purchase")
        }, 1000)
      } else {
        throw new Error(data.message || `Failed to ${isEditMode ? "update" : "add"} purchase`)
      }
    } catch (err) {
      console.error(`${isEditMode ? "Update" : "Add"} purchase error:`, err)
      toast.error(`Failed to ${isEditMode ? "update" : "add"} purchase: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-1" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Loading purchase data...</span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          {isEditMode ? "Edit Purchase" : "Add New Purchase"}
        </h1>
        <Link
          href="/admin/purchase"
          className="px-3 py-1 text-xs text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Purchase Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
              Purchase Details
            </h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Purchase Date*
              </label>
              <div className="relative">
                <Calendar className="absolute left-2 top-1.5 w-4 h-4 text-gray-500" />
                <DatePicker
                  selected={formData.purchaseDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="w-full pl-8 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Purchase Order No
              </label>
              <input
                type="text"
                name="purchaseOrderNo"
                value={formData.purchaseOrderNo}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                placeholder="e.g. PO-001"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Invoice No*
              </label>
              <input
                type="text"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                placeholder="e.g. INV-001"
              />
            </div>
          </div>
          
          {/* Supplier & Reference */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
              Supplier & Reference
            </h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Supplier*
              </label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleInputChange}
                required
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
              >
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={`supplier-${supplier.vendorId}`} value={supplier.vendorId}>
                    {supplier.vendorName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Reference No
              </label>
              <input
                type="text"
                name="refNo"
                value={formData.refNo}
                onChange={handleInputChange}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                placeholder="e.g. REF-001"
              />
            </div>
          </div>
          
          {/* Remarks & Status */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1">
              Additional Information
            </h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
                placeholder="Any notes about this purchase..."
              ></textarea>
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
          </div>
        </div>
        
        {/* Products Section */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-800 dark:text-white">
              Products
            </h3>
            <button 
              type="button"
              onClick={addProductLine} 
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Product
            </button>
          </div>
          
          <div className="overflow-x-auto mb-2">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-2 py-1 text-left font-medium text-gray-500 dark:text-gray-300">
                    Product
                  </th>
                  <th scope="col" className="px-2 py-1 text-right font-medium text-gray-500 dark:text-gray-300">
                    Price
                  </th>
                  <th scope="col" className="px-2 py-1 text-right font-medium text-gray-500 dark:text-gray-300">
                    Qty
                  </th>
                  <th scope="col" className="px-2 py-1 text-right font-medium text-gray-500 dark:text-gray-300">
                    Discount
                  </th>
                  <th scope="col" className="px-2 py-1 text-right font-medium text-gray-500 dark:text-gray-300">
                    Subtotal
                  </th>
                  <th scope="col" className="px-2 py-1 text-center font-medium text-gray-500 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {formData.items.map((item, index) => (
                  <tr key={`product-line-${index}`}>
                    <td className="px-2 py-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductLineChange(index, "productId", e.target.value)}
                        required
                        className="w-full px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-[0.65rem]"
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={`product-${product.productId}`} value={product.productId}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={item.purchasePrice}
                        onChange={(e) => handleProductLineChange(index, "purchasePrice", e.target.value)}
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-[0.65rem]"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={item.receiveQty}
                        onChange={(e) => handleProductLineChange(index, "receiveQty", e.target.value)}
                        min="1"
                        required
                        className="w-full px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-[0.65rem]"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleProductLineChange(index, "discount", e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-[0.65rem]"
                      />
                    </td>
                    <td className="px-2 py-1 text-right font-medium">
                      {(item.subtotal || 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button 
                        type="button"
                        onClick={() => removeProductLine(index)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {formData.items.length === 0 && (
                  <tr key="empty-product-row">
                    <td colSpan={6} className="px-2 py-2 text-center text-gray-500 dark:text-gray-400">
                      No products added yet. Click "Add Product" to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Totals Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2"></div>
          <div className="space-y-1 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-semibold text-gray-800 dark:text-white">{calculateTotalAmount().subtotal}</span>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400">
                Discount
              </label>
              <input
                type="number"
                name="overallDiscount"
                value={formData.overallDiscount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400">
                Additional Charges
              </label>
              <input
                type="number"
                name="additionalCharge"
                value={formData.additionalCharge}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs"
              />
            </div>
            
            <div className="flex justify-between text-xs pt-1 border-t border-gray-200 dark:border-gray-600 mt-1">
              <span className="text-gray-800 dark:text-gray-300 font-medium">Total:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{calculateTotalAmount().total}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-600">
          <Link
            href="/admin/purchase"
            className="px-2 py-1 text-xs text-gray-700 bg-gray-200 rounded-md mr-1 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="w-3 h-3 mr-1" />
                {isEditMode ? "Update Purchase" : "Save Purchase"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}