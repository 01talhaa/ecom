"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Mail, Phone, MapPin, Calendar, FileText, Tag } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"

export default function PurchaseDetailsPage({ params }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params)
  const vendorId = unwrappedParams.id
  
  const [vendorDetails, setVendorDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getAuthToken } = useAuth()
  
  useEffect(() => {
    fetchVendorDetails()
  }, [vendorId])
  
  // Fetch vendor purchase details from API
  const fetchVendorDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getAuthToken()
      
      if (!token) {
        throw new Error("Authentication token is missing")
      }
      
      const response = await fetch(`/api/proxy/api/v1/purchase`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Vendor Details API Response:", data)
      
      if (data.success) {
        // Find the vendor with the matching ID
        const vendorData = data.data.result?.find(vendor => 
          vendor.vendorId.toString() === vendorId.toString()
        )
        
        if (vendorData) {
          setVendorDetails(vendorData)
        } else {
          throw new Error("Vendor not found")
        }
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    })
  }

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return formatCurrency(0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-1" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Loading vendor details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="mb-2 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchVendorDetails}
              className="text-xs text-red-700 dark:text-red-400 underline mt-2 flex items-center"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Try again
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Link
            href="/admin/purchase"
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Purchase List
          </Link>
        </div>
      </div>
    )
  }

  if (!vendorDetails) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Vendor details not found.</p>
          <Link
            href="/admin/purchase"
            className="flex items-center justify-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Purchase List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="mb-4">
        <Link
          href="/admin/purchase"
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Purchase List
        </Link>
        
        {/* Vendor Info */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {vendorDetails.vendorName}
            </h1>
            
            <div className="mt-2 md:mt-0 flex items-center text-gray-500 dark:text-gray-300 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs ${
                vendorDetails.status 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}>
                {vendorDetails.status ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">Contact Person:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">{vendorDetails.contactPerson || "-"}</span>
            </div>
            
            <div className="flex items-start">
              <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{vendorDetails.phoneNumber || "-"}</span>
            </div>
            
            <div className="flex items-start">
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{vendorDetails.email || "-"}</span>
            </div>
            
            <div className="flex items-start md:col-span-2">
              <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {[
                  vendorDetails.street,
                  vendorDetails.city,
                  vendorDetails.stateProvince,
                  vendorDetails.postalCode,
                  vendorDetails.country
                ].filter(Boolean).join(", ") || "-"}
              </span>
            </div>
            
            <div className="flex items-start">
              <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{vendorDetails.vendorType || "-"}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap mt-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <div className="text-sm text-blue-800 dark:text-blue-300">Total Purchase Value</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(vendorDetails.totalPurchase || 0)}
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              <div className="text-sm text-green-800 dark:text-green-300">Total Discount</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(vendorDetails.totalDiscount || 0)}
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md">
              <div className="text-sm text-purple-800 dark:text-purple-300">Total Purchases</div>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {vendorDetails.purchaseDetails?.length || 0}
              </div>
            </div>
          </div>
        </div>
        
        {/* Purchase Details */}
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Purchase History
        </h2>
        
        {vendorDetails.purchaseDetails && vendorDetails.purchaseDetails.length > 0 ? (
          vendorDetails.purchaseDetails.map((purchase, index) => (
            <div key={`purchase-${purchase.purchaseId}-${index}`} className="mb-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 p-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-800 dark:text-white mr-2">Invoice #:</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{purchase.invoiceNo || "-"}</span>
                    </div>
                    
                    <div className="flex items-center mt-1">
                      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(purchase.purchaseDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-0">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        PO#: {purchase.purchaseOrderNo || "-"}
                      </span>
                    </div>
                    
                    <div className="flex items-center mt-1 justify-end">
                      <span className={`px-1.5 py-0.5 rounded-full text-[0.65rem] ${
                        purchase.status 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {purchase.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Purchase Line Items */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Qty
                      </th>
                      <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Discount
                      </th>
                      <th scope="col" className="px-2 py-1 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {purchase.purchaseChildren && purchase.purchaseChildren.map((item, itemIndex) => (
                      <tr 
                        key={`item-${purchase.purchaseId}-${item.childId}-${item.productId}-${itemIndex}`} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-900 dark:text-gray-300">
                          Product #{item.productId}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.purchasePrice)} <span className="text-[0.6rem]">x {item.conversionRate}</span>
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400">
                          {item.receiveQty}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-right text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.discount)}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-right text-xs font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.receiveAmt)}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Summary Row */}
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan="3" className="px-2 py-1 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                        Additional Charge:
                      </td>
                      <td className="px-2 py-1 text-right text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(purchase.additionalCharge || 0)}
                      </td>
                      <td className="px-2 py-1 text-right text-xs font-medium text-gray-900 dark:text-white">
                        {/* Empty cell for alignment */}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td colSpan="3" className="px-2 py-1 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                        Overall Discount:
                      </td>
                      <td className="px-2 py-1 text-right text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(purchase.overallDiscount || 0)}
                      </td>
                      <td className="px-2 py-1 text-right text-xs font-medium text-gray-900 dark:text-white">
                        {/* Empty cell for alignment */}
                      </td>
                    </tr>
                    <tr className="bg-gray-100 dark:bg-gray-700 font-medium">
                      <td colSpan="4" className="px-2 py-1 text-right text-xs text-gray-700 dark:text-gray-200">
                        Total:
                      </td>
                      <td className="px-2 py-1 text-right text-xs font-bold text-gray-900 dark:text-white">
                        {formatCurrency(
                          purchase.purchaseChildren?.reduce((sum, item) => sum + parseFloat(item.receiveAmt || 0), 0) + 
                          parseFloat(purchase.additionalCharge || 0) - 
                          parseFloat(purchase.overallDiscount || 0)
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Remarks */}
              {purchase.remarks && (
                <div className="p-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Remarks: </span>
                  {purchase.remarks}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 text-center rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">No purchase details available for this vendor.</p>
          </div>
        )}
      </div>
    </div>
  )
}