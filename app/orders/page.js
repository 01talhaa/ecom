"use client"

import { useEffect, useState, Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

// Import the order storage utility at the top of the file
import { getUserOrders } from "@/lib/orderStorage"

function OrdersContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    if (!loading && !user) {
      router.push("/auth/login?redirect=/orders")
    } else if (user) {
      // Fetch user orders
      fetchOrders()
    }
  }, [user, loading, router])

  // Replace the fetchOrders function with this updated version
  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // Get orders from localStorage
      let userOrders = []

      if (user) {
        userOrders = getUserOrders(user.id)
      }

      // If no orders in localStorage, use mock data for demo
      if (userOrders.length === 0) {
        const mockOrders = [
          {
            id: "ORD-1001",
            date: "2023-05-15",
            status: "Delivered",
            total: 145.98,
            paymentMethod: "bKash",
            items: [
              {
                id: "1",
                name: "Premium Cotton T-Shirt",
                quantity: 2,
                price: 20.0,
                image: "/placeholder.svg",
              },
              {
                id: "2",
                name: "Wireless Bluetooth Headphones",
                quantity: 1,
                price: 108.0,
                image: "/placeholder.svg",
              },
            ],
          },
          {
            id: "ORD-1002",
            date: "2023-06-22",
            status: "Processing",
            total: 85.5,
            paymentMethod: "Nagad",
            items: [
              {
                id: "1",
                name: "Premium Cotton T-Shirt",
                quantity: 1,
                price: 20.0,
                image: "/placeholder.svg",
              },
              {
                id: "3",
                name: "Leather Wallet",
                quantity: 1,
                price: 65.5,
                image: "/placeholder.svg",
              },
            ],
          },
        ]
        userOrders = mockOrders
      }

      // Simulate API delay
      setTimeout(() => {
        setOrders(userOrders)
        setIsLoading(false)
      }, 800)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setIsLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 border border-green-200"
      case "Processing":
        return "bg-blue-100 text-blue-800 border border-blue-200"
      case "Shipped":
        return "bg-purple-100 text-purple-800 border border-purple-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 border border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse max-w-4xl mx-auto">
          <div className="h-10 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will redirect, this prevents flash of content
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center md:text-left">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-medium text-gray-700 mb-4">You haven't placed any orders yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Once you place an order, it will appear here for you to track.</p>
          <Link href="/products" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 bg-gray-50 border-b flex flex-col sm:flex-row justify-between">
                <div>
                  <div className="flex items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Order #{order.id}</h2>
                    <span
                      className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Placed on {new Date(order.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:text-right">
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-800">{order.paymentMethod}</p>
                  <p className="font-bold text-lg mt-1 text-blue-600">${order.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-medium mb-4 text-gray-700 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Items
                </h3>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, index) => (
                    <div key={`${order.id}-${item.id}-${index}`} className="py-4 flex items-center">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-6 flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          Qty: {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                <Link 
                  href={`/orders/${order.id}`} 
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </Link>
                {order.status === "Delivered" && (
                  <button className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 text-sm font-medium transition-colors flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Write a Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  )
}