import Link from "next/link"
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Total Sales</h2>
          <p className="text-3xl font-bold">$12,345</p>
          <p className="text-sm text-green-600 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Orders</h2>
          <p className="text-3xl font-bold">156</p>
          <p className="text-sm text-green-600 mt-2">+8% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Customers</h2>
          <p className="text-3xl font-bold">1,245</p>
          <p className="text-sm text-green-600 mt-2">+15% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Products</h2>
          <p className="text-3xl font-bold">48</p>
          <p className="text-sm text-blue-600 mt-2">5 low in stock</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Order ID</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">#1234</td>
                <td className="py-2">John Doe</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Delivered</span>
                </td>
                <td className="py-2">$120.00</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">#1235</td>
                <td className="py-2">Jane Smith</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Processing</span>
                </td>
                <td className="py-2">$85.00</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">#1236</td>
                <td className="py-2">Robert Johnson</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Shipped</span>
                </td>
                <td className="py-2">$210.00</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">#1237</td>
                <td className="py-2">Emily Davis</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Cancelled</span>
                </td>
                <td className="py-2">$65.00</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4">
            <Link href="/admin/orders" className="text-blue-600 hover:text-blue-800">
              View all orders →
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Low Stock Products</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-left py-2">SKU</th>
                <th className="text-left py-2">Current Stock</th>
                <th className="text-left py-2">Min Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Premium Cotton T-Shirt</td>
                <td className="py-2">TSH-001</td>
                <td className="py-2 text-red-600">5</td>
                <td className="py-2">10</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Wireless Headphones</td>
                <td className="py-2">WH-002</td>
                <td className="py-2 text-red-600">3</td>
                <td className="py-2">5</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Smart Watch</td>
                <td className="py-2">SW-003</td>
                <td className="py-2 text-yellow-600">8</td>
                <td className="py-2">10</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Bluetooth Speaker</td>
                <td className="py-2">BS-004</td>
                <td className="py-2 text-yellow-600">7</td>
                <td className="py-2">10</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4">
            <Link href="/admin/inventory" className="text-blue-600 hover:text-blue-800">
              Manage inventory →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

