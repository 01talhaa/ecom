"use client"

import { useState, useEffect, Suspense } from "react"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import BkashPayment from "@/components/payment/BkashPayment"
// Import the order storage utility at the top of the file
import { addUserOrder } from "@/lib/orderStorage"

function CheckoutContent() {
  const { cart, clearCart, initialized } = useCart()
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Bangladesh",
  })
  const [paymentMethod, setPaymentMethod] = useState("bkash")
  const [bkashNumber, setBkashNumber] = useState("")
  const [showBkashPayment, setShowBkashPayment] = useState(false)
  const [orderProcessing, setOrderProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState("")

  // Don't render until cart is initialized
  if (!initialized) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = 10 // Fixed shipping cost for now
  const total = subtotal + shipping

  useEffect(() => {
    let redirect = false
    let prefill = false

    if (!loading && !user) {
      redirect = true
    }

    if (user) {
      prefill = true
    }

    if (redirect) {
      router.push("/auth/login?redirect=/checkout")
    }

    if (prefill) {
      setShippingInfo((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user, loading, router])

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()

    if (paymentMethod === "bkash") {
      setShowBkashPayment(true)
    } else {
      setStep(3)
    }
  }

  const handleBkashPaymentComplete = (success) => {
    setShowBkashPayment(false)
    if (success) {
      setStep(3)
    }
  }

  // Replace the handlePlaceOrder function with this updated version
  const handlePlaceOrder = async () => {
    setOrderProcessing(true)

    try {
      // In a real app, you would send order data to your API
      // For demo purposes, we'll simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a random order ID
      const newOrderId = "ORD-" + Math.floor(1000 + Math.random() * 9000)
      setOrderId(newOrderId)

      // Create order object
      const orderDate = new Date().toISOString()
      const newOrder = {
        id: newOrderId,
        date: orderDate,
        status: "Processing",
        total: total,
        paymentMethod: paymentMethod,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || "/placeholder.svg",
        })),
        shippingInfo: { ...shippingInfo },
      }

      // Save order to localStorage
      if (user) {
        addUserOrder(user.id, newOrder)
      }

      // Clear the cart
      clearCart()

      // Set order as complete
      setOrderComplete(true)

      // After 3 seconds, redirect to the orders page
      setTimeout(() => {
        router.push("/orders")
      }, 3000)
    } catch (error) {
      console.error("Error processing order:", error)
      alert("There was an error processing your order. Please try again.")
    } finally {
      setOrderProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will redirect, this prevents flash of content
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto dark:bg-gray-800">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 dark:text-white">Order Confirmed!</h2>
          <p className="text-gray-600 mb-4 dark:text-gray-300">Your order #{orderId} has been placed successfully.</p>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            We've sent a confirmation email to {shippingInfo.email} with your order details.
          </p>
          <div className="flex flex-col space-y-3">
            <Link href="/orders" className="btn-primary">
              View My Orders
            </Link>
            <Link href="/" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Checkout</h1>
        <p className="mb-8 dark:text-gray-300">Your cart is empty</p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                1
              </div>
              <div className="ml-4 font-semibold dark:text-white">Shipping Information</div>
            </div>

            {step === 1 && (
              <form onSubmit={handleShippingSubmit} className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Country</label>
                    <select
                      className="form-input"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      required
                    >
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="India">India</option>
                      <option value="Pakistan">Pakistan</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full">
                  Continue to Payment
                </button>
              </form>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                2
              </div>
              <div className="ml-4 font-semibold dark:text-white">Payment Method</div>
            </div>

            {step === 2 && (
              <form onSubmit={handlePaymentSubmit} className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Select Payment Method
                  </label>

                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bkash"
                        checked={paymentMethod === "bkash"}
                        onChange={() => setPaymentMethod("bkash")}
                        className="mr-2 focus:ring-blue-500" //Focus Style
                      />
                      <span className="dark:text-gray-300">bKash</span>
                    </label>

                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="nagad"
                        checked={paymentMethod === "nagad"}
                        onChange={() => setPaymentMethod("nagad")}
                        className="mr-2 focus:ring-blue-500" //Focus Style
                      />
                      <span className="dark:text-gray-300">Nagad</span>
                    </label>

                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="sslcommerz"
                        checked={paymentMethod === "sslcommerz"}
                        onChange={() => setPaymentMethod("sslcommerz")}
                        className="mr-2 focus:ring-blue-500" //Focus Style
                      />
                      <span className="dark:text-gray-300">SSLCommerz</span>
                    </label>

                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mr-2 focus:ring-blue-500" //Focus Style
                      />
                      <span className="dark:text-gray-300">Cash on Delivery</span>
                    </label>
                  </div>
                </div>

                {paymentMethod === "bkash" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      bKash Number
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="01XXXXXXXXX"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                      Enter the bKash number you want to pay from
                    </p>
                  </div>
                )}

                {paymentMethod !== "cod" && paymentMethod !== "bkash" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      {paymentMethod === "nagad" ? "Nagad Number" : "Card Details"}
                    </label>
                    <input
                      type={paymentMethod === "nagad" ? "tel" : "text"}
                      className="form-input"
                      placeholder={paymentMethod === "nagad" ? "01XXXXXXXXX" : "Card number"}
                      required
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {paymentMethod === "bkash" ? "Proceed to bKash Payment" : "Continue to Review"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div>
            <div className="flex items-center mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                3
              </div>
              <div className="ml-4 font-semibold dark:text-white">Review & Place Order</div>
            </div>

            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Order Review</h3>

                <div className="mb-6">
                  <h4 className="font-medium mb-2 dark:text-gray-300">Shipping Information</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{shippingInfo.fullName}</p>
                    <p>{shippingInfo.email}</p>
                    <p>{shippingInfo.phone}</p>
                    <p>{shippingInfo.address}</p>
                    <p>
                      {shippingInfo.city}, {shippingInfo.postalCode}
                    </p>
                    <p>{shippingInfo.country}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-2 dark:text-gray-300">Payment Method</h4>
                  <p className="text-sm text-gray-600 capitalize dark:text-gray-400">{paymentMethod}</p>
                  {paymentMethod === "bkash" && bkashNumber && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">bKash Number: {bkashNumber}</p>
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-2 dark:text-gray-300">Order Items</h4>
                  <div className="border rounded-md overflow-hidden dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left dark:text-gray-300">Product</th>
                          <th className="px-4 py-2 text-right dark:text-gray-300">Quantity</th>
                          <th className="px-4 py-2 text-right dark:text-gray-300">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                        {cart.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 dark:text-gray-300">{item.name}</td>
                            <td className="px-4 py-2 text-right dark:text-gray-300">{item.quantity}</td>
                            <td className="px-4 py-2 text-right dark:text-gray-300">
                              ${(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1">
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="btn-primary flex-1"
                    disabled={orderProcessing}
                  >
                    {orderProcessing ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Order Summary</h2>

            <div className="mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="dark:text-gray-300">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="dark:text-gray-300">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between mb-2">
              <span className="dark:text-gray-300">Subtotal</span>
              <span className="dark:text-gray-300">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span className="dark:text-gray-300">Shipping</span>
              <span className="dark:text-gray-300">${shipping.toFixed(2)}</span>
            </div>

            <div className="border-t my-4 dark:border-gray-700"></div>

            <div className="flex justify-between mb-4">
              <span className="font-semibold dark:text-white">Total</span>
              <span className="font-semibold dark:text-white">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* bKash Payment Modal */}
      {showBkashPayment && (
        <BkashPayment amount={total} phoneNumber={bkashNumber} onComplete={handleBkashPaymentComplete} />
      )}
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}