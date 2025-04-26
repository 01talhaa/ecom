"use client"

import React, { useState, useEffect } from 'react'
import { Edit, Trash2, Plus, Eye, AlertCircle, Search, X, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

// Helper function to safely parse JSON
const safelyParseJson = async (response) => {
  try {
    // First check if response is ok
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // Get the response text first
    const text = await response.text();
    
    // If empty response, return a default structure
    if (!text || text.trim() === '') {
      console.warn('Empty response received from API');
      return { success: false, message: 'Empty response received from server' };
    }
    
    // Try to parse the text as JSON
    try {
      return JSON.parse(text);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError, 'Raw response:', text);
      return { success: false, message: 'Invalid JSON response from server' };
    }
  } catch (err) {
    console.error('Response error:', err);
    return { success: false, message: err.message };
  }
};

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'add', 'edit', 'view'
  const [currentBranch, setCurrentBranch] = useState(null);
  const [formData, setFormData] = useState({
    branchName: '',
    branchAddress: '',
    branchExecutive: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getAuthToken } = useAuth();

  useEffect(() => {
    fetchBranches();
  }, [currentPage]);

  // Fetch branches from API
  const fetchBranches = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(`/api/proxy/api/v1/branches?page=${currentPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await safelyParseJson(response);
      
      if (data.success) {
        setBranches(data.data.result);
        setTotalItems(data.data.meta.total);
        setTotalPages(data.data.meta.totalPage);
      } else {
        throw new Error(data.message || "Failed to fetch branches");
      }
    } catch (err) {
      console.error("Error fetching branches:", err);
      setError(err.message || "An error occurred while fetching branches");
    } finally {
      setLoading(false);
    }
  };

  // Fetch single branch details
  const fetchBranchDetails = async (branchId) => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(`/api/proxy/api/v1/branches/${branchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await safelyParseJson(response);
      
      if (data.success) {
        setCurrentBranch(data.data);
        // When viewing or editing, set the form data
        if (viewMode === 'edit') {
          setFormData({
            branchName: data.data.branchName,
            branchAddress: data.data.branchAddress,
            branchExecutive: data.data.branchExecutive
          });
        }
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch branch details");
      }
    } catch (err) {
      console.error("Error fetching branch details:", err);
      setError(err.message || "An error occurred while fetching branch details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle add branch form submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.branchName) {
      setError("Branch name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch("/api/proxy/api/v1/branches", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await safelyParseJson(response);
      
      if (data.success) {
        // Reset form and go back to list view
        setFormData({
          branchName: '',
          branchAddress: '',
          branchExecutive: ''
        });
        setViewMode('list');
        fetchBranches(); // Refresh the list
        alert("Branch added successfully");
      } else {
        throw new Error(data.message || "Failed to add branch");
      }
    } catch (err) {
      console.error("Error adding branch:", err);
      setError(err.message || "An error occurred while adding the branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit branch form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.branchName) {
      setError("Branch name is required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await fetch(`/api/proxy/api/v1/branches/${currentBranch.branchId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await safelyParseJson(response);
      
      if (data.success) {
        // Reset form and go back to list view
        setFormData({
          branchName: '',
          branchAddress: '',
          branchExecutive: ''
        });
        setCurrentBranch(null);
        setViewMode('list');
        fetchBranches(); // Refresh the list
        alert("Branch updated successfully");
      } else {
        throw new Error(data.message || "Failed to update branch");
      }
    } catch (err) {
      console.error("Error updating branch:", err);
      setError(err.message || "An error occurred while updating the branch");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle branch deletion
  const handleDelete = async (branchId) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      setLoading(true);
      setError(null);

      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error("Authentication token is missing");
        }

        const response = await fetch(`/api/proxy/api/v1/branches/${branchId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await safelyParseJson(response);
        
        if (data.success) {
          fetchBranches(); // Refresh the list
          alert("Branch deleted successfully");
        } else {
          throw new Error(data.message || "Failed to delete branch");
        }
      } catch (err) {
        console.error("Error deleting branch:", err);
        setError(err.message || "An error occurred while deleting the branch");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle view branch
  const handleView = async (branchId) => {
    const branchData = await fetchBranchDetails(branchId);
    if (branchData) {
      setViewMode('view');
    }
  };

  // Handle edit branch
  const handleEdit = async (branchId) => {
    const branchData = await fetchBranchDetails(branchId);
    if (branchData) {
      setViewMode('edit');
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter branches by search term
  const filteredBranches = branches.filter(branch => 
    branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.branchAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.branchExecutive.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form and return to list view
  const handleCancel = () => {
    setFormData({
      branchName: '',
      branchAddress: '',
      branchExecutive: ''
    });
    setCurrentBranch(null);
    setViewMode('list');
    setError(null);
  };

  // Render the branch list view
  const renderBranchList = () => (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">Branches</h1>
        <button
          onClick={() => setViewMode('add')}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Branch
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchBranches}
              className="text-[0.6rem] text-red-700 dark:text-red-400 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          placeholder="Search branches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No branches found</p>
          <button
            onClick={() => setViewMode('add')}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Branch
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Branch Name
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Branch Address
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Executive
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBranches.map((branch) => (
                <tr key={branch.branchId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-gray-900 dark:text-gray-100 text-sm">
                    {branch.branchName}
                  </td>
                  <td className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                    {branch.branchAddress}
                  </td>
                  <td className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                    {branch.branchExecutive}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        branch.status
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      }`}
                    >
                      {branch.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(branch.branchId)}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                        title="View Branch"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(branch.branchId)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit Branch"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(branch.branchId)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-xs text-gray-700 dark:text-gray-300">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className={`px-2 py-1 rounded-md text-xs ${
                    currentPage === 1 || loading
                      ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className={`px-2 py-1 rounded-md text-xs ${
                    currentPage === totalPages || loading
                      ? "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  // Render the add branch form
  const renderAddForm = () => (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={handleCancel}
          className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Branch</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleAddSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="mb-4">
          <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Branch Name *
          </label>
          <input
            type="text"
            id="branchName"
            name="branchName"
            value={formData.branchName}
            onChange={handleChange}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="branchAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Branch Address
          </label>
          <textarea
            id="branchAddress"
            name="branchAddress"
            value={formData.branchAddress}
            onChange={handleChange}
            rows="3"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="branchExecutive" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Branch Executive
          </label>
          <input
            type="text"
            id="branchExecutive"
            name="branchExecutive"
            value={formData.branchExecutive}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Saving...
              </>
            ) : (
              'Save Branch'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Render the edit branch form
  const renderEditForm = () => (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={handleCancel}
          className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Branch</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-xs text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleEditSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="mb-4">
            <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch Name *
            </label>
            <input
              type="text"
              id="branchName"
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              required
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="branchAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch Address
            </label>
            <textarea
              id="branchAddress"
              name="branchAddress"
              value={formData.branchAddress}
              onChange={handleChange}
              rows="3"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="branchExecutive" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Branch Executive
            </label>
            <input
              type="text"
              id="branchExecutive"
              name="branchExecutive"
              value={formData.branchExecutive}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Updating...
                </>
              ) : (
                'Update Branch'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  // Render branch details view
  const renderViewDetails = () => (
    <div>
      <div className="flex items-center mb-4">
        <button
          onClick={handleCancel}
          className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Branch Details</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : currentBranch ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{currentBranch.branchName}</h2>
            <div className="flex items-center mb-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentBranch.status
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                }`}
              >
                {currentBranch.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch ID</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentBranch.branchId}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Address</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {currentBranch.branchAddress || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch Executive</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentBranch.branchExecutive || 'N/A'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created By</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentBranch.createdBy || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Back to List
            </button>
            <button
              onClick={() => handleEdit(currentBranch.branchId)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Branch
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Branch details not found</p>
          <button
            onClick={handleCancel}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>
      )}
    </div>
  );

  // Main component render logic
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {viewMode === 'list' && renderBranchList()}
      {viewMode === 'add' && renderAddForm()}
      {viewMode === 'edit' && renderEditForm()}
      {viewMode === 'view' && renderViewDetails()}
    </div>
  );
}