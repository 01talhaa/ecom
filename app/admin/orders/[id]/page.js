"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer, Download } from "lucide-react"
import Image from "next/image"

export default function OrderDetail() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true)
      // In a real app, you would fetch the order from your API
      // For demo purposes, we'll create mock data
      const mockOrder = {
        id: id,
        date: "2023-05-15T10:30:00Z",
        customer: {
          id: "CUST-101",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
        },
        status: "Processing",
        total: 145.98,
        subtotal: 135.98,
        shipping: 10.0,
        tax: 0,
        paymentMethod: "bKash",
        paymentStatus: "Paid",
        shippingAddress: {
          street: "123 Main Street",
          city: "Dhaka",
          state: "",
          postalCode: "1000",
          country: "Bangladesh",
        },
        items: [
          {
            id: "1",
            name: "Premium Cotton T-Shirt",
            quantity: 2,
            price: 20.0,
            total: 40.0,
            image: "/placeholder.svg",
          },
          {
            id: "2",
            name: "Wireless Bluetooth Headphones",
            quantity: 1,
            price: 108.0,
            total: 108.0,
            image: "/placeholder.svg",
          },
        ],
        timeline: [
          {
            status: "Order Placed",
            date: "2023-05-15T10:30:00Z",
            note: "Order was placed by customer",
          },
          {
            status: "Payment Confirmed",
            date: "2023-05-15T10:35:00Z",
            note: "Payment was confirmed via bKash",
          },
          {
            status: "Processing",
            date: "2023-05-15T14:20:00Z",
            note: "Order is being processed",
          },
        ],
      }

      setOrder(mockOrder)
      setNewStatus(mockOrder.status)
      setLoading(false)
    }
    fetchOrder()
  }, [id])

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return

    setStatusUpdateLoading(true)

    try {
      // In a real app, you would call an API to update the order status
      // For demo purposes, we'll simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedTimeline = [
        ...order.timeline,
        {
          status: newStatus,
          date: new Date().toISOString(),
          note: `Order status updated to ${newStatus}`,
        },
      ]

      setOrder({
        ...order,
        status: newStatus,
        timeline: updatedTimeline,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-4">Order not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The order you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/admin/orders")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <button
              onClick={() => router.push("/admin/orders")}
              className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Order {order.id}</h1>
            <span className={`ml-4 px-3 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </button>
            <button className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Order Summary</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right font-medium">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200 dark:border-gray-700">
                  <tr>
                    <th
                      colSpan="3"
                      className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Subtotal
                    </th>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 font-medium">
                      ${order.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <th
                      colSpan="3"
                      className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Shipping
                    </th>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 font-medium">
                      ${order.shipping.toFixed(2)}
                    </td>
                  </tr>
                  {order.tax > 0 && (
                    <tr>
                      <th
                        colSpan="3"
                        className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"
                      >
                        Tax
                      </th>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 font-medium">
                        ${order.tax.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <th colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                      Total
                    </th>
                    <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100 font-bold">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.timeline.map((event, index) => (
                <div key={index} className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    {index < order.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-blue-200 dark:bg-blue-900"></div>
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.status}</div>
                      <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.date).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{event.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Order Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Date</div>
                <div className="text-sm text-gray-900 dark:text-gray-100">{new Date(order.date).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Method</div>
                <div className="text-sm text-gray-900 dark:text-gray-100">{order.paymentMethod}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Payment Status</div>
                <div className="text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      order.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</div>
                <div className="text-sm text-gray-900 dark:text-gray-100">{order.customer.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
                <div className="text-sm text-gray-900 dark:text-gray-100">{order.customer.email}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</div>
                <div className="text-sm text-gray-900 dark:text-gray-100">{order.customer.phone}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Shipping Address</h2>
            <div className="text-sm text-gray-900 dark:text-gray-100">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Update Status</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={statusUpdateLoading || newStatus === order.status}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {statusUpdateLoading ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

