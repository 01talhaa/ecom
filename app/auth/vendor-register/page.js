"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"
import toast, { Toaster } from 'react-hot-toast'

export default function VendorRegister() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    refUser: "",
    vendorName: "",
    contactPerson: "",
    vendorAddress: "",
    mobile: ""
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    // Vendor name validation
    if (!formData.vendorName) {
      newErrors.vendorName = "Vendor name is required"
    }
    
    // Contact person validation
    if (!formData.contactPerson) {
      newErrors.contactPerson = "Contact person name is required"
    }
    
    // Vendor address validation
    if (!formData.vendorAddress) {
      newErrors.vendorAddress = "Vendor address is required"
    }
    
    // Mobile validation
    if (!formData.mobile) {
      newErrors.mobile = "Mobile number is required"
    } else if (!/^\d{10,15}$/.test(formData.mobile.replace(/[^0-9]/g, ''))) {
      newErrors.mobile = "Please enter a valid mobile number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch("/api/proxy/api/v1/auth/vendor_register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.status) {
        // Show success message
        toast.success(data.message || "Your registration request has been submitted successfully!")
        setSuccess(true)
        
        // Clear form
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          refUser: "",
          vendorName: "",
          contactPerson: "",
          vendorAddress: "",
          mobile: ""
        })
        
        // Redirect after a delay (optional)
        setTimeout(() => {
          router.push("/auth/vendor-login")
        }, 5000)
      } else {
        // Show error message
        const errorMessage = data.message || "Registration failed. Please try again."
        setSubmitError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("Vendor registration error:", error)
      setSubmitError("An unexpected error occurred. Please try again.")
      toast.error("Connection error. Please check your internet and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Vendor Registration</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Apply to become a vendor on our platform</p>
          </div>
          <div className="relative h-16 w-16">
            <Image src="/placeholder.svg" alt="Logo" fill className="object-contain" />
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 flex">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{submitError}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4 flex">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
            <div className="text-sm text-green-600 dark:text-green-400">
              <p className="font-medium">Your registration request has been submitted!</p>
              <p className="mt-1">Please wait for approval from the admin. You will be redirected to the login page.</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-3 border ${
                  errors.email ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-3 border ${
                    errors.password ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-3 border ${
                    errors.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Vendor Name */}
            <div>
              <label htmlFor="vendorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vendor/Business Name *
              </label>
              <input
                id="vendorName"
                name="vendorName"
                type="text"
                required
                value={formData.vendorName}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-3 border ${
                  errors.vendorName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Your Business Name"
              />
              {errors.vendorName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vendorName}</p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Person Name *
              </label>
              <input
                id="contactPerson"
                name="contactPerson"
                type="text"
                required
                value={formData.contactPerson}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-3 border ${
                  errors.contactPerson ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Your Name"
              />
              {errors.contactPerson && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contactPerson}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mobile Number *
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                value={formData.mobile}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-3 border ${
                  errors.mobile ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                placeholder="+1 (123) 456-7890"
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mobile}</p>
              )}
            </div>

            {/* Referee (optional) */}
            <div>
              <label htmlFor="refUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Referral Code (Optional)
              </label>
              <input
                id="refUser"
                name="refUser"
                type="text"
                value={formData.refUser}
                onChange={handleChange}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Referral code if you have one"
              />
            </div>

            {/* Vendor Address */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="vendorAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Business Address *
              </label>
              <textarea
                id="vendorAddress"
                name="vendorAddress"
                rows="3"
                required
                value={formData.vendorAddress}
                onChange={handleChange}
                className={`appearance-none block w-full px-3 py-3 border ${
                  errors.vendorAddress ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Your complete business address"
              />
              {errors.vendorAddress && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vendorAddress}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/auth/vendor-login"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>

          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>
              By submitting this application, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}