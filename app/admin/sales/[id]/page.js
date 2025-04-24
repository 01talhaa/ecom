"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Printer, Download } from "lucide-react"

// Mock sales data (same as in the sales list page)
const mockSales = [
  {
    id: "S1001",
    date: "2023-06-15",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
    },
    items: [
      { id: "1", name: "Premium Cotton T-Shirt", quantity: 2, price: 20.0 },
      { id: "3", name: "Denim Jeans", quantity: 1, price: 45.0 },
    ],
    subtotal: 85.0,
    tax: 8.5,
    discount: 0,
    total: 93.5,
    paymentMethod: "Credit Card",
    status: "completed",
    salesPerson: "Admin User",
  },
  {
    id: "S1002",
    date: "2023-06-16",
    customer: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 (555) 987-6543",
    },
    items: [{ id: "2", name: "Wireless Bluetooth Headphones", quantity: 1, price: 108.0 }],
    subtotal: 108.0,
    tax: 10.8,
    discount: 10.0,
    total: 108.8,
    paymentMethod: "Cash",
    status: "completed",
    salesPerson: "Admin User",
  },
  {
    id: "S1003",
    date: "2023-06-17",
    customer: {
      name: "Robert Johnson",
      email: "robert@example.com",
      phone: "+1 (555) 456-7890",
    },
    items: [
      { id: "4", name: "Smartphone Case", quantity: 3, price: 15.0 },
      { id: "5", name: "Screen Protector", quantity: 3, price: 10.0 },
    ],
    subtotal: 75.0,
    tax: 7.5,
    discount: 5.0,
    total: 77.5,
    paymentMethod: "Mobile Payment",
    status: "completed",
    salesPerson: "Sales Staff 1",
  },
  {
    id: "S1004",
    date: "2023-06-18",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "+1 (555) 234-5678",
    },
    items: [
      { id: "1", name: "Premium Cotton T-Shirt", quantity: 1, price: 20.0 },
      { id: "6", name: "Smartwatch", quantity: 1, price: 199.0 },
    ],
    subtotal: 219.0,
    tax: 21.9,
    discount: 20.0,
    total: 220.9,
    paymentMethod: "Credit Card",
    status: "pending",
    salesPerson: "Sales Staff 2",
  },
  {
    id: "S1005",
    date: "2023-06-19",
    customer: {
      name: "Michael Wilson",
      email: "michael@example.com",
      phone: "+1 (555) 876-5432",
    },
    items: [
      { id: "7", name: "Laptop Backpack", quantity: 1, price: 65.0 },
      { id: "8", name: "Wireless Mouse", quantity: 1, price: 25.0 },
      { id: "9", name: "USB-C Cable", quantity: 2, price: 12.0 },
    ],
    subtotal: 114.0,
    tax: 11.4,
    discount: 0,
    total: 125.4,
    paymentMethod: "Bank Transfer",
    status: "completed",
    salesPerson: "Admin User",
  },
]

export default function SaleDetailsPage() {
  const params = useParams()
  const { id } = params
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      const foundSale = mockSales.find((s) => s.id === id)
      setSale(foundSale || null)
      setLoading(false)
    }, 500)
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!sale) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sale Details</h1>
          <Link href="/admin/sales" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500 dark:text-gray-400">Sale not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sale Details: {sale.id}</h1>
        <div className="flex space-x-2">
          <Link href="/admin/sales" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </Link>
          <button className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
            <Printer className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button className="bg-gray-200 dark:bg-gray-700 p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">
            <Download className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Sale Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sale ID:</span>
              <span className="font-medium">{sale.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="font-medium">{new Date(sale.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  sale.status === "completed"
                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                    : sale.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                }`}
              >
                {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
              <span className="font-medium">{sale.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sales Person:</span>
              <span className="font-medium">{sale.salesPerson}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-medium">{sale.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium">{sale.customer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Phone:</span>
              <span className="font-medium">{sale.customer.phone}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Sale Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="font-medium">${sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Discount:</span>
              <span className="font-medium">-${sale.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tax:</span>
              <span className="font-medium">${sale.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-gray-800 dark:text-gray-200">Total:</span>
                <span>${sale.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Items</h2>
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sale.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

