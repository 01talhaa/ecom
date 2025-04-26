"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { AlertCircle, Save, RefreshCw } from 'lucide-react';

export default function PermissionsPage() {
  // Available roles in the system
  const [selectedRole, setSelectedRole] = useState('manager');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Define all admin panel features and their default permissions
  const [permissions, setPermissions] = useState({
    // Dashboard
    viewDashboard: true,
    viewAnalytics: true,
    
    // Products
    viewProducts: true,
    addProduct: false,
    editProduct: false,
    deleteProduct: false,
    manageCategories: false,
    manageBrands: false,
    manageUnits: false,
    
    // Inventory
    viewInventory: true,
    adjustStock: false,
    manageVendors: false,
    createPurchase: false,
    managePurchaseReturns: false,
    manageDamagedGoods: false,
    
    // Sales
    viewSales: true,
    createSale: false,
    manageSaleReturns: false,
    
    // Branches
    viewBranches: true,
    manageBranches: false,
    viewBranchStock: true,
    manageBranchIssue: false,
    viewBranchSales: true,
    manageBranchReturns: false,
    
    // Orders
    viewOrders: true,
    createOrder: false,
    updateOrder: false,
    deleteOrder: false,
    exportOrders: false,
    
    // Customers
    viewCustomers: true,
    addCustomer: false,
    editCustomer: false,
    deleteCustomer: false,
    
    // Users
    viewUsers: false,
    addUser: false,
    editUser: false,
    deleteUser: false,
    
    // Permissions
    managePermissions: false,
    
    // Reports
    viewReports: true,
    exportReports: false,
    
    // Settings
    viewSettings: false,
    updateSettings: false,
  });

  // Available roles for selection
  const roles = [
    { id: 'admin', name: 'Administrator' },
    { id: 'manager', name: 'Manager' },
    { id: 'salesman', name: 'Salesman' }
  ];

  // Predefined permission sets for each role
  const rolePermissionTemplates = {
    admin: {
      // Admin has all permissions
      viewDashboard: true,
      viewAnalytics: true,
      viewProducts: true,
      addProduct: true,
      editProduct: true,
      deleteProduct: true,
      manageCategories: true,
      manageBrands: true,
      manageUnits: true,
      viewInventory: true,
      adjustStock: true,
      manageVendors: true,
      createPurchase: true,
      managePurchaseReturns: true,
      manageDamagedGoods: true,
      viewSales: true,
      createSale: true,
      manageSaleReturns: true,
      viewBranches: true,
      manageBranches: true,
      viewBranchStock: true,
      manageBranchIssue: true,
      viewBranchSales: true,
      manageBranchReturns: true,
      viewOrders: true,
      createOrder: true,
      updateOrder: true,
      deleteOrder: true,
      exportOrders: true,
      viewCustomers: true,
      addCustomer: true,
      editCustomer: true,
      deleteCustomer: true,
      viewUsers: true,
      addUser: true,
      editUser: true,
      deleteUser: true,
      managePermissions: true,
      viewReports: true,
      exportReports: true,
      viewSettings: true,
      updateSettings: true
    },
    manager: {
      // Manager has most permissions except user and permission management
      viewDashboard: true,
      viewAnalytics: true,
      viewProducts: true,
      addProduct: true,
      editProduct: true,
      deleteProduct: false,
      manageCategories: true,
      manageBrands: true,
      manageUnits: true,
      viewInventory: true,
      adjustStock: true,
      manageVendors: true,
      createPurchase: true,
      managePurchaseReturns: true,
      manageDamagedGoods: true,
      viewSales: true,
      createSale: true,
      manageSaleReturns: true,
      viewBranches: true,
      manageBranches: false,
      viewBranchStock: true,
      manageBranchIssue: true,
      viewBranchSales: true,
      manageBranchReturns: true,
      viewOrders: true,
      createOrder: true,
      updateOrder: true,
      deleteOrder: false,
      exportOrders: true,
      viewCustomers: true,
      addCustomer: true,
      editCustomer: true,
      deleteCustomer: false,
      viewUsers: true,
      addUser: false,
      editUser: false,
      deleteUser: false,
      managePermissions: false,
      viewReports: true,
      exportReports: true,
      viewSettings: true,
      updateSettings: false
    },
    salesman: {
      // Salesman has limited view and sales permissions
      viewDashboard: true,
      viewAnalytics: false,
      viewProducts: true,
      addProduct: false,
      editProduct: false,
      deleteProduct: false,
      manageCategories: false,
      manageBrands: false,
      manageUnits: false,
      viewInventory: true,
      adjustStock: false,
      manageVendors: false,
      createPurchase: false,
      managePurchaseReturns: false,
      manageDamagedGoods: false,
      viewSales: true,
      createSale: true,
      manageSaleReturns: false,
      viewBranches: false,
      manageBranches: false,
      viewBranchStock: false,
      manageBranchIssue: false,
      viewBranchSales: false,
      manageBranchReturns: false,
      viewOrders: true,
      createOrder: true,
      updateOrder: true,
      deleteOrder: false,
      exportOrders: false,
      viewCustomers: true,
      addCustomer: true,
      editCustomer: true,
      deleteCustomer: false,
      viewUsers: false,
      addUser: false,
      editUser: false,
      deleteUser: false,
      managePermissions: false,
      viewReports: false,
      exportReports: false,
      viewSettings: false,
      updateSettings: false
    }
  };

  // Load permissions when role changes
  useEffect(() => {
    // Simulate loading permissions from API
    setLoading(true);
    
    // In a real application, you would fetch the permissions from the API
    setTimeout(() => {
      // For now, we'll use predefined templates
      if (rolePermissionTemplates[selectedRole]) {
        setPermissions(rolePermissionTemplates[selectedRole]);
      }
      setLoading(false);
    }, 500);
  }, [selectedRole]);

  // Handle permission toggle
  const handleTogglePermission = (key) => {
    setPermissions({
      ...permissions,
      [key]: !permissions[key]
    });
    // Reset success message when changes are made
    setSaveSuccess(false);
  };

  // Save permissions
  const handleSavePermissions = () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    // Simulate API request delay
    setTimeout(() => {
      // In a real application, you would send the permissions to the API
      console.log(`Saving permissions for ${selectedRole}:`, permissions);
      setLoading(false);
      setSaveSuccess(true);
      
      // Auto-hide the success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };

  // Reset permissions to default for selected role
  const handleResetPermissions = () => {
    setLoading(true);
    
    // In a real application, you would fetch the default permissions from the API
    setTimeout(() => {
      if (rolePermissionTemplates[selectedRole]) {
        setPermissions(rolePermissionTemplates[selectedRole]);
      }
      setLoading(false);
      setSaveSuccess(false);
    }, 500);
  };

  // Group permissions by category for better organization
  const permissionCategories = [
    {
      name: 'Dashboard',
      permissions: [
        { key: 'viewDashboard', label: 'View Dashboard' },
        { key: 'viewAnalytics', label: 'View Analytics' },
      ]
    },
    {
      name: 'Products',
      permissions: [
        { key: 'viewProducts', label: 'View Products' },
        { key: 'addProduct', label: 'Add Products' },
        { key: 'editProduct', label: 'Edit Products' },
        { key: 'deleteProduct', label: 'Delete Products' },
        { key: 'manageCategories', label: 'Manage Categories' },
        { key: 'manageBrands', label: 'Manage Brands' },
        { key: 'manageUnits', label: 'Manage Units' },
      ]
    },
    {
      name: 'Inventory',
      permissions: [
        { key: 'viewInventory', label: 'View Inventory' },
        { key: 'adjustStock', label: 'Adjust Stock' },
        { key: 'manageVendors', label: 'Manage Vendors' },
        { key: 'createPurchase', label: 'Create Purchase' },
        { key: 'managePurchaseReturns', label: 'Manage Purchase Returns' },
        { key: 'manageDamagedGoods', label: 'Manage Damaged Goods' },
      ]
    },
    {
      name: 'Sales',
      permissions: [
        { key: 'viewSales', label: 'View Sales' },
        { key: 'createSale', label: 'Create Sale' },
        { key: 'manageSaleReturns', label: 'Manage Sale Returns' },
      ]
    },
    {
      name: 'Branches',
      permissions: [
        { key: 'viewBranches', label: 'View Branches' },
        { key: 'manageBranches', label: 'Manage Branches' },
        { key: 'viewBranchStock', label: 'View Branch Stock' },
        { key: 'manageBranchIssue', label: 'Manage Branch Issues' },
        { key: 'viewBranchSales', label: 'View Branch Sales' },
        { key: 'manageBranchReturns', label: 'Manage Branch Returns' },
      ]
    },
    {
      name: 'Orders',
      permissions: [
        { key: 'viewOrders', label: 'View Orders' },
        { key: 'createOrder', label: 'Create Orders' },
        { key: 'updateOrder', label: 'Update Orders' },
        { key: 'deleteOrder', label: 'Delete Orders' },
        { key: 'exportOrders', label: 'Export Orders' },
      ]
    },
    {
      name: 'Customers',
      permissions: [
        { key: 'viewCustomers', label: 'View Customers' },
        { key: 'addCustomer', label: 'Add Customers' },
        { key: 'editCustomer', label: 'Edit Customers' },
        { key: 'deleteCustomer', label: 'Delete Customers' },
      ]
    },
    {
      name: 'Users',
      permissions: [
        { key: 'viewUsers', label: 'View Users' },
        { key: 'addUser', label: 'Add Users' },
        { key: 'editUser', label: 'Edit Users' },
        { key: 'deleteUser', label: 'Delete Users' },
      ]
    },
    {
      name: 'System',
      permissions: [
        { key: 'managePermissions', label: 'Manage Permissions' },
        { key: 'viewReports', label: 'View Reports' },
        { key: 'exportReports', label: 'Export Reports' },
        { key: 'viewSettings', label: 'View Settings' },
        { key: 'updateSettings', label: 'Update Settings' },
      ]
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-0">Role Permissions</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleResetPermissions}
            disabled={loading}
            className="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handleSavePermissions}
            disabled={loading}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Permissions
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md">
          Permissions for {roles.find(r => r.id === selectedRole)?.name} have been saved successfully.
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Role
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedRole === role.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {role.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {permissionCategories.map(category => (
            <div key={category.name} className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">{category.name}</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.permissions.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                      <Switch
                        checked={permissions[key] || false}
                        onChange={() => handleTogglePermission(key)}
                        className={`${
                          permissions[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                      >
                        <span
                          className={`${
                            permissions[key] ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSavePermissions}
          disabled={loading}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Permissions
            </>
          )}
        </button>
      </div>
    </div>
  );
}