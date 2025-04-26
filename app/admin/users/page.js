"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Eye,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Filter,
  Search,
  AlertCircle
} from "lucide-react";

export default function UserManagement() {
  // Authentication context
  const { getAuthToken } = useAuth();

  // States
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    branch: "",
    role: ""
  });

  // Form state
  const [formData, setFormData] = useState({
    userId: null,
    name: "",
    email: "",
    phone: "",
    password: "",
    branchId: "",
    role: ""
  });

  // Selected user for editing/deleting
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users and branches on component mount
  useEffect(() => {
    // fetchUsers();
    fetchBranches();
  }, []);

  // Fetch users from API
//   const fetchUsers = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const token = getAuthToken();
//       const response = await fetch("/api/proxy/api/v1/users", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json"
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`Error fetching users: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data.success) {
//         setUsers(data.data || []);
//       } else {
//         throw new Error(data.message || "Failed to fetch users");
//       }
//     } catch (err) {
//       setError(err.message);
//       console.error("Error fetching users:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

// First, add the safelyParseJson helper function from branches page
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

// Then update the fetchBranches function
const fetchBranches = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token is missing");
    }

    const response = await fetch("/api/proxy/api/v1/branches", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await safelyParseJson(response);
    
    if (data.success) {
      // Check if data has a nested result structure like in branches page
      if (data.data && data.data.result) {
        setBranches(data.data.result);
      } else if (Array.isArray(data.data)) {
        // Handle case where data might be a direct array
        setBranches(data.data);
      } else {
        // Fallback to empty array if unexpected structure
        console.warn("Unexpected API response structure:", data);
        setBranches([]);
      }
      console.log("Branches loaded successfully:", data);
    } else {
      throw new Error(data.message || "Failed to fetch branches");
    }
  } catch (err) {
    console.error("Error fetching branches:", err);
    // Initialize branches as empty array in case of error
    setBranches([]);
  }
};

  // Open modal for adding new user
  const handleAddUser = () => {
    setIsEditing(false);
    setFormData({
      userId: null,
      name: "",
      email: "",
      phone: "",
      password: "",
      branchId: "",
      role: ""
    });
    setShowPassword(false);
    setShowUserModal(true);
  };

  // Open modal for editing existing user
  const handleEditUser = (user) => {
    setIsEditing(true);
    setSelectedUser(user);
    setFormData({
      userId: user.userId,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "", // Don't populate password for security
      branchId: user.branchId || "",
      role: user.role || ""
    });
    setShowPassword(false);
    setShowUserModal(true);
  };

  // Open confirmation dialog for user deletion
  const handleDeletePrompt = (user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/proxy/api/v1/users/${selectedUser.userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error deleting user: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Remove user from local state
        setUsers(users.filter(user => user.userId !== selectedUser.userId));
        setShowDeleteConfirm(false);
        setSelectedUser(null);
      } else {
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error deleting user:", err);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission (create/update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = getAuthToken();
      const endpoint = isEditing 
        ? `/api/proxy/api/v1/users/${formData.userId}` 
        : "/api/proxy/api/v1/users";
      
      const method = isEditing ? "PUT" : "POST";
      
      // For editing, we might not want to send password if it's empty
      const payload = isEditing && !formData.password 
        ? {...formData, password: undefined} 
        : formData;
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error ${isEditing ? "updating" : "creating"} user: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        if (isEditing) {
          // Update user in local state
          setUsers(users.map(user => 
            user.userId === formData.userId ? {...user, ...formData} : user
          ));
        } else {
          // Add new user to local state
          setUsers(prev => [...prev, data.data]);
        }
        
        // Close modal and reset form
        setShowUserModal(false);
        setFormData({
          userId: null,
          name: "",
          email: "",
          phone: "",
          password: "",
          branchId: "",
          role: ""
        });
      } else {
        throw new Error(data.message || `Failed to ${isEditing ? "update" : "create"} user`);
      }
    } catch (err) {
      setError(err.message);
      console.error(`Error ${isEditing ? "updating" : "creating"} user:`, err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      branch: "",
      role: ""
    });
    setSearchTerm("");
  };

  // Filter users based on search and filter options
  const filteredUsers = users.filter(user => {
    // Search term filter
    const matchesSearch = searchTerm.trim() === "" ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm));

    // Branch filter
    const matchesBranch = filterOptions.branch === "" || 
      user.branchId === filterOptions.branch;

    // Role filter
    const matchesRole = filterOptions.role === "" || 
      user.role === filterOptions.role;

    return matchesSearch && matchesBranch && matchesRole;
  });

  // Get branch name from ID
  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.branchId === branchId);
    return branch ? branch.branchName : `Branch #${branchId}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">User Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={handleAddUser}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div>
            <p>{error}</p>
            <button 
              onClick={() => {
                fetchUsers();
                fetchBranches();
                setError(null);
              }}
              className="text-sm underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Branch</label>
              <select
  name="branch"
  value={filterOptions.branch}
  onChange={handleFilterChange}
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
>
  <option value="">All Branches</option>
  {Array.isArray(branches) && branches.map((branch) => (
    <option key={branch.branchId} value={branch.branchId}>
      {branch.branchName}
    </option>
  ))}
</select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                name="role"
                value={filterOptions.role}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="manager">Manager</option>
                <option value="salesman">Salesman</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email / Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Branch
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                  <p className="mt-2">Loading users...</p>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No users found. 
                  {searchTerm || filterOptions.branch || filterOptions.role
                    ? " Try clearing your filters." 
                    : ""}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <div>{user.email || "No email"}</div>
                    <div className="text-xs">{user.phone || "No phone"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {user.branchId ? getBranchName(user.branchId) : "No branch"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "manager" 
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" 
                        : user.role === "salesman" 
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {user.role || "No role"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Edit User"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeletePrompt(user)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {isEditing ? "Edit User" : "Add New User"}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Branch
                    </label>
<select
  name="branchId"
  value={formData.branchId}
  onChange={handleChange}
  required
  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
>
  <option value="">Select branch</option>
  {Array.isArray(branches) && branches.map(branch => (
    <option key={branch.branchId} value={branch.branchId}>
      {branch.branchName}
    </option>
  ))}
</select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select role</option>
                      <option value="manager">Manager</option>
                      <option value="salesman">Salesman</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password {isEditing && <span className="text-xs text-gray-500">(Leave blank to keep current)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                        placeholder={isEditing ? "Enter new password" : "Enter password"}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {isEditing ? "Update User" : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete the user <span className="font-semibold">{selectedUser.name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}