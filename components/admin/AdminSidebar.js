"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  User, // For single user/customer
  Shield, // For permissions/security
  KeyRound, // Alternative for permissions
  BarChart3,
  Settings,
  ChevronDown,
  FileText,
  ShoppingBag,
  Building,
  Tag,
  UserCog, // For user management
  DollarSign,
  CreditCard,
  History,
  Terminal,
  Receipt,
  PieChart,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({
    products: true,
    inventory: false,
    sales: false,
    branches: false,
    pos: false,
    barcode: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <div className="w-60 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto fixed">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Admin Panel
        </h2>
      </div>

      <nav className="p-3">
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin"
              className={`flex items-center p-2 rounded-md text-sm ${
                isActive("/admin")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>

          {/* Products Section */}
          <li>
            <button
              onClick={() => toggleMenu("products")}
              className={`flex items-center justify-between w-full p-2 rounded-md text-left text-sm ${
                pathname.includes("/admin/products") ||
                pathname.includes("/admin/categories") ||
                pathname.includes("/admin/brands") ||
                pathname.includes("/admin/units") ||
                pathname.includes("/admin/titles")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Products
              </div>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  openMenus.products ? "rotate-180" : ""
                }`}
              />
            </button>
            {openMenus.products && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/products"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/products")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/products/add"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/products/add")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Add Product
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/categories"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/categories")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Categories
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/brands"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/brands")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Brands
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/units"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/units")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Units
                  </Link>
                </li>
                {/* Add the new Titles menu item */}
                <li>
                  <Link
                    href="/admin/titles"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/titles")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      {/* <Tag className="w-4 h-4 mr-2" /> */}
                      Titles
                    </div>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Inventory Section */}
          <li>
            <button
              onClick={() => toggleMenu("inventory")}
              className={`flex items-center justify-between w-full p-2 rounded-md text-left text-sm ${
                pathname.includes("/admin/inventory") ||
                pathname.includes("/admin/vendors")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Inventory
              </div>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  openMenus.inventory ? "rotate-180" : ""
                }`}
              />
            </button>
            {openMenus.inventory && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/inventory"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/inventory")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Stock Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/vendors"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/vendors")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Vendor Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/purchase"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/inventory/purchase")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Purchase
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/inventory/purchase-return"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/inventory/purchase-return")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Purchase Return
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/inventory/damaged"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/inventory/damaged")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Damaged Goods
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Sales Section */}
          <li>
            <button
              onClick={() => toggleMenu("sales")}
              className={`flex items-center justify-between w-full p-2 rounded-md text-left text-sm ${
                pathname.includes("/admin/sales")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Sales
              </div>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  openMenus.sales ? "rotate-180" : ""
                }`}
              />
            </button>
            {openMenus.sales && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/sales"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/sales")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Sales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/sales/new"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/sales/new")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    New Sale
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/sales/returns"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/sales/returns")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Sales Returns
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Branch Management */}
          <li>
            <button
              onClick={() => toggleMenu("branches")}
              className={`flex items-center justify-between w-full p-2 rounded-md text-left text-sm ${
                isActive("/admin/branches")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Branches
              </div>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  openMenus.branches ? "rotate-180" : ""
                }`}
              />
            </button>
            {openMenus.branches && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/branches"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/branches")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Branches
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/branches/issue"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/branches/issue")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Branch Issue
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/branches/stock"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/branches/stock")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Branch Stock
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/branches/sales"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/branches/sales")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Branch Sales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/branches/returns"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/branches/returns")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Branch Returns
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* POS Section */}
          <li>
            <button
              onClick={() => toggleMenu("pos")}
              className={`flex items-center justify-between w-full p-2 rounded-md text-left text-sm ${
                pathname.includes("/admin/pos")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Terminal className="w-4 h-4 mr-2" />
                POS
              </div>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  openMenus.pos ? "rotate-180" : ""
                }`}
              />
            </button>
            {openMenus.pos && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/pos/pos"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/pos/terminal")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    POS
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/pos/transactions"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/pos/transactions")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Transactions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/pos/receipts"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/pos/receipts")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Receipts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/pos/payments"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/pos/payments")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Payment Methods
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/pos/reports"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/pos/reports")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    POS Reports
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Orders */}
          <li>
            <Link
              href="/admin/orders"
              className={`flex items-center p-2 rounded-md text-sm ${
                isActive("/admin/orders")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Orders
            </Link>
          </li>

          {/* Barcode Section */}
          <li>
            <button
              onClick={() => toggleMenu("barcode")}
              className={`flex items-center justify-between w-full p-2 rounded-md text-left text-sm ${
                pathname.includes("/admin/barcode")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Barcode
              </div>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  openMenus.barcode ? "rotate-180" : ""
                }`}
              />
            </button>
            {openMenus.barcode && (
              <ul className="pl-8 mt-1 space-y-1">
                <li>
                  <Link
                    href="/admin/barcode/generator"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/barcode/generator")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Generate Barcodes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/barcode/print"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/barcode/print")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Print Barcodes
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/admin/barcode/scan"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/barcode/scan")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Barcode Scanner
                  </Link>
                </li> */}
                {/* <li>
                  <Link
                    href="/admin/barcode/settings"
                    className={`block p-2 rounded-md text-xs ${
                      isActive("/admin/barcode/settings")
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    Barcode Settings
                  </Link>
                </li> */}
              </ul>
            )}
          </li>

          {/* Customers */}
          <li>
            <Link
              href="/admin/customers"
              className={`flex items-center p-2 rounded-md text-sm ${
                isActive("/admin/customers")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Customers
            </Link>
          </li>

          {/* Users */}
          <li>
            <Link
              href="/admin/users"
              className={`flex items-center p-2 rounded-md text-sm ${
                isActive("/admin/users")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <UserCog className="w-4 h-4 mr-2" />
              Users
            </Link>
          </li>

          {/* Permissions */}
          <li>
            <Link
              href="/admin/permissions"
              className={`flex items-center p-2 rounded-md text-sm ${
                isActive("/admin/permissions")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Shield className="w-4 h-4 mr-2" />
              Permissions
            </Link>
          </li>

          {/* Reports */}
          <li>
            <Link
              href="/admin/reports"
              className={`flex items-center p-2 rounded-md text-sm ${
                isActive("/admin/reports")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </Link>
          </li>

          {/* Settings */}
          <li>
            <Link
              href="/admin/settings"
              className={`flex items-center p-2 rounded-md text-sm ${
                isActive("/admin/settings")
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
