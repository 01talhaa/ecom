"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import ThemeToggle from "./ThemeToggle"
import { useFeatureFlag, FEATURES } from "@/context/FeatureFlagsContext"
import { 
  UserCircle, 
  ShoppingCart, 
  LogOut, 
  User, 
  Package, 
  Heart, 
  Settings, 
  ChevronDown,
  Search,
  Menu,
  X,
  Home,
  Layers,
  Grid,
  PcCase,
  Info,
  MessageSquare
} from "lucide-react"

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, logout } = useAuth()  // Access user from AuthContext
  const { cart } = useCart()
  const pcBuilderEnabled = useFeatureFlag(FEATURES.PC_BUILDER)
  const userMenuRef = useRef(null)
  const searchInputRef = useRef(null)

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      
      if (searchOpen && searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, searchOpen]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Focus search input when search is opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { href: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> },
    { href: "/products", label: "Products", icon: <Layers className="h-4 w-4 mr-2" /> },
    { href: "/categories", label: "Categories", icon: <Grid className="h-4 w-4 mr-2" /> },
    { href: "/pc-builder", label: "PC Builder", icon: <PcCase className="h-4 w-4 mr-2" /> },
    { href: "/about", label: "About", icon: <Info className="h-4 w-4 mr-2" /> },
    { href: "/contact", label: "Contact", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
  ];

  const userMenuItems = [
    { href: "/account", label: "My Account", icon: <User className="h-4 w-4" /> },
    { href: "/orders", label: "My Orders", icon: <Package className="h-4 w-4" /> },
    { href: "/wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
    { href: "/account/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 transition-all duration-300 z-50 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg' 
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-2 shadow-lg shadow-blue-400/20 dark:shadow-blue-700/20">
                <span className="text-white font-bold text-sm">NS</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                NextShop
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 relative group transition-all duration-200 text-sm font-medium"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-gradient-to-r from-blue-600 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full"></span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-1">
            {/* Search Button */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Search Overlay */}
            {searchOpen && (
              <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg p-4 border-t border-gray-200 dark:border-gray-700 z-20 animate-fadeDown">
                <div className="container mx-auto" ref={searchInputRef}>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="w-full p-3 pl-10 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                    <Search className="h-5 w-5 absolute left-3 top-3.5 text-gray-500 dark:text-gray-400" />
                    <button 
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart Button */}
            <Link
              href="/cart"
              className="p-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {user ? (
              <div className="relative user-menu-container ml-1" ref={userMenuRef}>
                <button
                  className="flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {user.avatar ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-1">
                      <UserCircle className="w-6 h-6" />
                    </div>
                  )}
                  <span className="ml-2 hidden sm:block text-sm font-medium truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-1 z-10 border border-gray-200 dark:border-gray-700 animate-fadeDown origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                          {user.userType === 'customer' ? 'Customer' : 
                           user.userType === 'admin' ? 'Admin' : 
                           user.userType === 'vendor' ? 'Vendor' : 'User'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <span className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 mr-3">
                            {item.icon}
                          </span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-md bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 mr-3">
                          <LogOut className="h-4 w-4" />
                        </span>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-2 hidden sm:flex items-center space-x-2">
                <Link
                  href="/auth/customer-login"
                  className="px-4 py-1.5 text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/customer-register"
                  className="px-4 py-1.5 text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-md shadow-blue-500/20 dark:shadow-blue-700/30"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              className="ml-2 md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none" // Added focus state
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-fadeDown">
          <div className="container mx-auto px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center py-2.5 px-3 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            
            {!user && (
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/auth/customer-login"
                  className="flex justify-center py-2 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/customer-register"
                  className="flex justify-center py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
            
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center py-2.5 px-3 text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center py-2.5 px-3 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}