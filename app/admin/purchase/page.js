"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export default function PurchasePage() {
  const [vendorSummaries, setVendorSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1,
  });
  const { getAuthToken } = useAuth();

  useEffect(() => {
    fetchPurchaseSummaries();
  }, []);

  // Filter purchase summaries based on search term
  const filteredSummaries = vendorSummaries.filter(
    (summary) =>
      summary.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch purchase summaries from API
  const fetchPurchaseSummaries = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(
        `/api/proxy/api/v1/purchase?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Purchase Summaries API Response:", data);

      if (data.success) {
        // Process the response data
        if (data.data && Array.isArray(data.data.result)) {
          setVendorSummaries(data.data.result);

          // Store pagination info if available
          if (data.data.meta) {
            setPagination({
              page: data.data.meta.page || 1,
              limit: data.data.meta.limit || 10,
              total: data.data.meta.total || 0,
              totalPage: data.data.meta.totalPage || 1,
            });
          }
        } else {
          console.warn(
            "API returned success but no result array was found",
            data
          );
          setVendorSummaries([]);
        }
      } else {
        // The API returned success: false
        if (data.message === "No Data Available") {
          // This is not an error, just no purchases yet
          setVendorSummaries([]);
        } else {
          throw new Error(data.message || "Failed to fetch purchase summaries");
        }
      }
    } catch (err) {
      console.error("Fetch purchase summaries error:", err);
      setError(
        "An error occurred while fetching purchase summaries: " + err.message
      );
      setVendorSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vendorId) => {
    if (
      !window.confirm("Are you sure you want to delete this purchase record?")
    ) {
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(`/api/proxy/api/v1/purchase/${vendorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success("Purchase record deleted successfully");
        // Remove the deleted vendor from the state
        setVendorSummaries((prev) =>
          prev.filter((vendor) => vendor.vendorId !== vendorId)
        );
      } else {
        throw new Error(data.message || "Failed to delete purchase record");
      }
    } catch (err) {
      console.error("Delete purchase error:", err);
      toast.error("Failed to delete purchase: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    fetchPurchaseSummaries(page, pagination.limit);
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0, // Remove decimal places to improve readability
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5"> {/* Reduced padding slightly */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4"> {/* Reduced margin */}
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200"> {/* Refined text color */}
          Vendor Purchase Summary
        </h1>
        <Link
          href="/admin/purchase/add"
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs transition-colors" // Added transition for hover effects
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Purchase
        </Link>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-1 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchPurchaseSummaries}
              className="text-[0.6rem] text-red-700 dark:text-red-400 underline mt-1 flex items-center hover:text-red-500"  // Added subtle hover effect
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Try again
            </button>
          </div>
        </div>
      )}

      <div className="mb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <Search className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-shadow" // Added transition and better shadow handling
            placeholder="Search by vendor name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-1" />
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Loading vendor summaries...
          </span>
        </div>
      ) : vendorSummaries.length > 0 ? (
        <>
          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Total vendors: {pagination.total || vendorSummaries.length}
            {pagination.totalPage > 1 &&
              ` | Page ${pagination.page} of ${pagination.totalPage}`}
          </div>

          <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700"> {/* Add border to contain the table */}
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-1.5 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Vendor Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1.5 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Phone Number
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1.5 text-right font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Total Purchases
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1.5 text-right font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Total Discount
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1.5 text-center font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSummaries.map((vendor) => (
                  <tr
                    key={vendor.vendorId || `vendor-${vendor.vendorId}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 h-8 transition-colors"  // Added transitions to the rows
                  >
                    <td className="px-3 py-1 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100 flex items-center">
                      {vendor.vendorName || "-"}{" "}
                      {vendor.purchaseDetails && (
                        <span className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-[0.65rem]">
                          {vendor.purchaseDetails.length}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {vendor.phoneNumber || "-"}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(vendor.totalPurchase || 0)}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-right text-gray-500 dark:text-gray-400">
                      {formatCurrency(vendor.totalDiscount || 0)}
                    </td>

                    <td className="px-3 py-1 whitespace-nowrap text-center">
                      <div className="flex justify-end space-x-1">
                        <Link
                          href={`/admin/purchase/details/${vendor.vendorId}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"  // Added transition to action buttons
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/purchase/add?id=${vendor.vendorId}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(vendor.vendorId)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSummaries.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No purchase records found with the given search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPage > 1 && (
            <div className="mt-2 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Showing {filteredSummaries.length} of {pagination.total} vendors
              </div>
              <div className="flex space-x-1">
                <button
                  className={`px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-xs transition-colors ${
                    pagination.page === 1
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </button>

                {Array.from(
                  { length: pagination.totalPage },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={`page-${page}`}
                    className={`px-2 py-0.5 rounded border text-xs transition-colors ${
                      pagination.page === page
                        ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-700 dark:border-blue-700"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className={`px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-xs transition-colors ${
                    pagination.page >= pagination.totalPage
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  disabled={pagination.page >= pagination.totalPage}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            No purchase records found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-3 text-xs">
            Get started by adding your first purchase record.
          </p>
          <Link
            href="/admin/purchase/add"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Purchase
          </Link>
        </div>
      )}
    </div>
  );
}