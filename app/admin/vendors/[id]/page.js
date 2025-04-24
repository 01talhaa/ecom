"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Edit, FileText, Plus, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function VendorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { id } = params
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const { getAuthToken } = useAuth()

  useEffect(() => {
    fetchVendorDetails()
  }, [id])

  const fetchVendorDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        setError("Authentication token is missing")
        setLoading(false)
        return
      }

      const response = await fetch(`/api/proxy/api/v1/vendors/${id}`, {
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
        setVendor(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch vendor details")
      }
    } catch (err) {
      console.error("Fetch vendor details error:", err)
      setError("An error occurred while fetching vendor details: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vendor Details</h1>
          <Link href="/admin/vendors" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-start text-red-500 mb-4">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
          <button 
            onClick={fetchVendorDetails} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Vendor Details</h1>
          <Link href="/admin/vendors" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-center text-gray-500 dark:text-gray-400">Vendor not found</p>
        </div>
      </div>
    )
  }

  // Format address parts safely
  const formatAddress = () => {
    const parts = []
    if (vendor.street) parts.push(vendor.street)
    
    const cityState = []
    if (vendor.city) cityState.push(vendor.city)
    if (vendor.stateProvince) cityState.push(vendor.stateProvince)
    
    if (cityState.length > 0) {
      parts.push(cityState.join(', '))
    }
    
    if (vendor.postalCode) parts.push(vendor.postalCode)
    if (vendor.country) parts.push(vendor.country)
    
    return parts.length > 0 ? parts.join(', ') : 'No address available'
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor: {vendor.vendorName}</h1>
        <div className="flex space-x-2">
          <Link href="/admin/vendors" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Link>
          <Link
            href={`/admin/vendors/edit/${vendor.vendorId}`}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Vendor
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{vendor.vendorName}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{formatAddress()}</p>
              <div className="mt-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    vendor.status
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                  }`}
                >
                  {vendor.status ? 'Active' : 'Inactive'}
                </span>
                {vendor.vendorType && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    {vendor.vendorType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium text-sm rounded-md mr-2 ${
                activeTab === "overview"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("financial")}
              className={`px-4 py-2 font-medium text-sm rounded-md mr-2 ${
                activeTab === "financial"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              Financial Info
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact Person</p>
                    <p className="font-medium">{vendor.contactPerson || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium">{vendor.email || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium">{vendor.phoneNumber || "Not provided"}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">Address</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Street</p>
                    <p className="font-medium">{vendor.street || "Not provided"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">City</p>
                      <p className="font-medium">{vendor.city || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">State/Province</p>
                      <p className="font-medium">{vendor.stateProvince || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Postal Code</p>
                      <p className="font-medium">{vendor.postalCode || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
                      <p className="font-medium">{vendor.country || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vendor Type</p>
                    <p className="font-medium">{vendor.vendorType || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vendor ID</p>
                    <p className="font-medium">{vendor.vendorId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
                    <p className="font-medium">User ID: {vendor.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Registration Date</p>
                    <p className="font-medium">
                      {new Date(vendor.createdTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          vendor.status
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                        }`}
                      >
                        {vendor.status ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">Notes</h3>
                <p className="text-gray-700 dark:text-gray-300">{vendor.note || "No notes available."}</p>
              </div>
            </div>
          )}

          {activeTab === "financial" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Terms</p>
                    <p className="font-medium">{vendor.paymentTerms || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tax ID/VAT Number</p>
                    <p className="font-medium">{vendor.taxID_VATNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}