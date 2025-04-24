"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"

// Mock products data
const mockProducts = [
  { id: "1", name: "Premium Cotton T-Shirt", price: 20.0, stock: 45 },
  { id: "2", name: "Wireless Bluetooth Headphones", price: 108.0, stock: 28 },
  { id: "3", name: "Denim Jeans", price: 45.0, stock: 32 },
  { id: "4", name: "Smartphone Case", price: 15.0, stock: 65 },
  { id: "5", name: "Screen Protector", price: 10.0, stock: 120 },
  { id: "6", name: "Smartwatch", price: 199.0, stock: 18 },
  { id: "7", name: "Laptop Backpack", price: 65.0, stock: 24 },
  { id: "8", name: "Wireless Mouse", price: 25.0, stock: 40 },
  { id: "9", name: "USB-C Cable", price: 12.0, stock: 85 },
  { id: "10", name: "Bluetooth Speaker", price: 55.0, stock: 30 },
]

// Mock customers data
const mockCustomers = [
  { id: "C1", name: "John Doe", email: "john@example.com", phone: "+1 (555) 123-4567" },
  { id: "C2", name: "Jane Smith", email: "jane@example.com", phone: "+1 (555) 987-6543" },
  { id: "C3", name: "Robert Johnson", email: "robert@example.com", phone: "+1 (555) 456-7890" },
  { id: "C4", name: "Emily Davis", email: "emily@example.com", phone: "+1 (555) 234-5678" },
  { id: "C5", name: "Michael Wilson", email: "michael@example.com", phone: "+1 (555) 876-5432" },
]

export default function NewSalePage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [saleData, setSaleData] = useState({
    customer: "",
    items: [],
    paymentMethod: "Credit Card",
    notes: "",
    taxRate: 10, // 10%
    discount: 0,
  })

  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setProducts(mockProducts)
      setCustomers(mockCustomers)
      setLoading(false)
    }, 500)
  }, [])

  const handleAddItem = () => {
    if (!selectedProduct) {
      setErrors((prev) => ({ ...prev, product: "Please select a product" }))
      return
    }

    if (selectedQuantity < 1) {
      setErrors((prev) => ({ ...prev, quantity: "Quantity must be at least 1" }))
      return
    }

    const product = products.find((p) => p.id === selectedProduct)

    if (!product) return

    // Check if product is already in the list
    const existingItemIndex = saleData.items.findIndex((item) => item.productId === selectedProduct)

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...saleData.items]
      updatedItems[existingItemIndex].quantity += selectedQuantity
      setSaleData((prev) => ({ ...prev, items: updatedItems }))
    } else {
      // Add new item
      setSaleData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: selectedQuantity,
            total: product.price * selectedQuantity,
          },
        ],
      }))
    }

    // Reset selection
    setSelectedProduct("")
    setSelectedQuantity(1)
    setErrors((prev) => ({ ...prev, product: null, quantity: null }))
  }

  const handleRemoveItem = (index) => {
    setSaleData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return

    const updatedItems = [...saleData.items]
    updatedItems[index].quantity = newQuantity
    updatedItems[index].total = updatedItems[index].price * newQuantity

    setSaleData((prev) => ({ ...prev, items: updatedItems }))
  }

  const calculateSubtotal = () => {
    return saleData.items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() - saleData.discount) * (saleData.taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() - saleData.discount + calculateTax()
  }

  const validateForm = () => {
    const newErrors = {}

    if (!saleData.customer) newErrors.customer = "Please select a customer"
    if (saleData.items.length === 0) newErrors.items = "Please add at least one item"
    if (saleData.discount < 0) newErrors.discount = "Discount cannot be negative"
    if (saleData.discount > calculateSubtotal()) newErrors.discount = "Discount cannot exceed subtotal"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you would send the data to your API
      console.log("Sale data submitted:", {
        ...saleData,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        date: new Date().toISOString(),
      })

      // Redirect to sales list
      router.push("/admin/sales")
    } catch (error) {
      console.error("Error creating sale:", error)
      alert("Failed to create sale. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Sale</h1>
        <Link href="/admin/sales" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sales
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer*</label>
              <select
                value={saleData.customer}
                onChange={(e) => {
                  setSaleData((prev) => ({ ...prev, customer: e.target.value }))
                  setErrors((prev) => ({ ...prev, customer: null }))
                }}
                className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${
                  errors.customer ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
              {errors.customer && <p className="mt-1 text-sm text-red-500">{errors.customer}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
              <select
                value={saleData.paymentMethod}
                onChange={(e) => setSaleData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Payment">Mobile Payment</option>
                <option value="Check">Check</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Items</h2>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <div className="flex-grow">
                <select
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value)
                    setErrors((prev) => ({ ...prev, product: null }))
                  }}
                  className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${
                    errors.product ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.price.toFixed(2)} (Stock: {product.stock})
                    </option>
                  ))}
                </select>
                {errors.product && <p className="mt-1 text-sm text-red-500">{errors.product}</p>}
              </div>

              <div className="w-full md:w-32">
                <input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) => {
                    setSelectedQuantity(Number.parseInt(e.target.value) || 1)
                    setErrors((prev) => ({ ...prev, quantity: null }))
                  }}
                  className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 ${
                    errors.quantity ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Qty"
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>

            {errors.items && <p className="mt-1 text-sm text-red-500 mb-2">{errors.items}</p>}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {saleData.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, item.quantity - 1)}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 w-8 h-8 rounded-l-md flex items-center justify-center"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, Number.parseInt(e.target.value) || 1)}
                            className="w-16 h-8 text-center border-t border-b dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                            className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 w-8 h-8 rounded-r-md flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {saleData.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No items added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                value={saleData.notes}
                onChange={(e) => setSaleData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
              ></textarea>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-4">Sale Summary</h3>

              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">${calculateSubtotal().toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-gray-600 dark:text-gray-300 mr-2">Discount:</span>
                  <input
                    type="number"
                    min="0"
                    value={saleData.discount}
                    onChange={(e) => {
                      setSaleData((prev) => ({ ...prev, discount: Number.parseFloat(e.target.value) || 0 }))
                      setErrors((prev) => ({ ...prev, discount: null }))
                    }}
                    className={`w-20 p-1 border rounded-md dark:bg-gray-600 dark:border-gray-500 ${
                      errors.discount ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                <span className="text-gray-900 dark:text-white">-${saleData.discount.toFixed(2)}</span>
              </div>
              {errors.discount && <p className="mt-1 text-sm text-red-500 mb-2">{errors.discount}</p>}

              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-gray-600 dark:text-gray-300 mr-2">Tax Rate:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={saleData.taxRate}
                    onChange={(e) =>
                      setSaleData((prev) => ({ ...prev, taxRate: Number.parseFloat(e.target.value) || 0 }))
                    }
                    className="w-16 p-1 border border-gray-300 rounded-md dark:bg-gray-600 dark:border-gray-500"
                  />
                  <span className="text-gray-600 dark:text-gray-300 ml-1">%</span>
                </div>
                <span className="text-gray-900 dark:text-white">${calculateTax().toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-800 dark:text-gray-200">Total:</span>
                  <span className="text-gray-900 dark:text-white">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/admin/sales" className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-400">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Complete Sale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

