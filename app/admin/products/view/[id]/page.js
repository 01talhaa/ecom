"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
// Update your imports to include:
import { 
  Search, Edit, Edit2, Trash2, ChevronLeft, ChevronRight, X, Check, 
  Hash, Tag, Box, Calendar, Percent, BarChart, Star, Globe, Package,
  ToggleLeft,Bookmark, ToggleRight, Info, ShieldCheck, AlertCircle, Truck, List,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import MediaGallery from './MediaGallery';

// Helper function to check for invalid image sources
const isValidImageSource = (src) => {
  if (!src) return false;
  if (typeof src !== 'string') return false;
  return !src.startsWith('blob:');
};

// Add this new component for the media gallery


export default function ViewProduct() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editFormData, setEditFormData] = useState(null)
  const { getAuthToken } = useAuth()

  useEffect(() => {
    fetchProductDetails()
    fetchSupplementaryData()
  }, [id])

  // Fetch categories, brands, and units for reference
  const fetchSupplementaryData = async () => {
    try {
      const token = getAuthToken()
      if (!token) return;

      // Fetch categories
      try {
        const categoryResponse = await fetch(`/api/proxy/api/v1/category`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (categoryResponse.ok) {
          const data = await categoryResponse.json();
          if (data.success && data.data?.result) {
            setCategories(data.data.result);
          }
        }
      } catch (e) {
        console.error("Error fetching categories:", e);
      }

      // Fetch brands (assuming similar API structure)
      try {
        const brandResponse = await fetch(`/api/proxy/api/v1/brand`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (brandResponse.ok) {
          const data = await brandResponse.json();
          if (data.success && data.data?.result) {
            setBrands(data.data.result);
          }
        }
      } catch (e) {
        console.error("Error fetching brands:", e);
      }

      // Fetch units (assuming similar API structure)
      try {
        const unitResponse = await fetch(`/api/proxy/api/v1/unit`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (unitResponse.ok) {
          const data = await unitResponse.json();
          if (data.success && data.data?.result) {
            setUnits(data.data.result);
          }
        }
      } catch (e) {
        console.error("Error fetching units:", e);
      }

    } catch (err) {
      console.error("Error fetching supplementary data:", err);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        throw new Error("Authentication token is missing")
      }

      // Fetch the product details
      const productResponse = await fetch(`/api/proxy/api/v1/product/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!productResponse.ok) {
        throw new Error(`API error: ${productResponse.status}`)
      }

      const productData = await productResponse.json()
      
      if (!productData.success) {
        throw new Error(productData.message || "Failed to fetch product details")
      }
      
      const productResult = productData.data;
      
      // Fetch category name
      let categoryName = `Category ${productResult.categoryId}`;
      let subCategoryName = `SubCategory ${productResult.subCategoryId}`;
      
      try {
        const categoryResponse = await fetch(`/api/proxy/api/v1/category`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          if (categoryData.success && Array.isArray(categoryData.data?.result)) {
            const matchedCategory = categoryData.data.result.find(cat => cat.categoryId === productResult.categoryId);
            if (matchedCategory) {
              categoryName = matchedCategory.categoryName;
            }

            // Try to find subcategory (assuming they come from the same API)
            const matchedSubCategory = categoryData.data.result.find(cat => cat.categoryId === productResult.subCategoryId);
            if (matchedSubCategory) {
              subCategoryName = matchedSubCategory.categoryName;
            }
          }
        }
      } catch (categoryError) {
        console.error("Error fetching category details:", categoryError);
      }
      
      // Process the product data
      const processedProduct = {
        ...productResult,
        thumbnail: isValidImageSource(productResult.thumbnail) ? productResult.thumbnail : "/placeholder.svg",
        categoryName,
        subCategoryName,
        // Process images to handle blob URLs
        images: Array.isArray(productResult.images) ? productResult.images.map(img => ({
          ...img,
          imageUrl: isValidImageSource(img.imageUrl) ? img.imageUrl : "/placeholder.svg"
        })) : []
      };
      
      setProduct(processedProduct);
      
      // Initialize edit form with current values
      setEditFormData({
        ...processedProduct,
        // Convert dates to the format expected by input[type="date"]
        expiredDate: processedProduct.expiredDate ? 
          new Date(processedProduct.expiredDate).toISOString().split('T')[0] : '',
      });
      
    } catch (err) {
      console.error("Fetch product details error:", err)
      setError("An error occurred while fetching product details: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      // Prepare the data for submission
      const submitData = {
        ...editFormData,
        // Convert string fields that should be numbers
        categoryId: parseInt(editFormData.categoryId),
        subCategoryId: parseInt(editFormData.subCategoryId),
        brandId: parseInt(editFormData.brandId),
        unitId: parseInt(editFormData.unitId),
        discountRate: parseFloat(editFormData.discountRate),
        vatAmount: parseFloat(editFormData.vatAmount),
        // Keep existing images and specs
        images: product.images,
        specifications: product.specifications,
        seo: product.seo,
        variants: product.variants
      };

      // Make the API call
      const response = await fetch(`/api/proxy/api/v1/product/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to update product");
      }

      // Update local data
      setProduct({
        ...submitData,
        // Re-format necessary fields
        thumbnail: isValidImageSource(submitData.thumbnail) ? submitData.thumbnail : "/placeholder.svg",
      });
      
      // Exit edit mode
      setEditMode(false);
      
      // Show success message
      alert("Product updated successfully!");
      
    } catch (err) {
      console.error("Save product error:", err);
      alert("Failed to update product: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <Link href="/admin/products" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </div>
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchProductDetails}
              className="text-xs text-red-700 dark:text-red-400 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <Link href="/admin/products" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">Product not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">The requested product could not be found.</p>
        </div>
      </div>
    )
  }

  // Add this helper function inside your ViewProduct component
  const isValidImageUrl = (url) => {
    if (!url) return false;
    if (typeof url !== 'string') return false;
    return url !== '' && !url.startsWith('blob:');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/admin/products" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>
        
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Product
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => setEditMode(false)}
              className="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center ${
                saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-4 py-2 rounded-md`}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {editMode ? (
        // Edit Mode View
        <div className="space-y-8">
          {/* Basic Information Section */}
          <div className="border dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-700">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="productName"
                  value={editFormData.productName || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={editFormData.barcode || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={editFormData.slug || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiredDate"
                  value={editFormData.expiredDate || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={editFormData.categoryId || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sub Category
                </label>
                <select
                  name="subCategoryId"
                  value={editFormData.subCategoryId || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Sub Category</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Brand
                </label>
                <select
                  name="brandId"
                  value={editFormData.brandId || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Brand</option>
                  {brands.map(brand => (
                    <option key={brand.brandId} value={brand.brandId}>
                      {brand.brandName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit
                </label>
                <select
                  name="unitId"
                  value={editFormData.unitId || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select Unit</option>
                  {units.map(unit => (
                    <option key={unit.unitId} value={unit.unitId}>
                      {unit.unitName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="productDescription"
                  value={editFormData.productDescription || ''}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">HTML is supported</p>
              </div>
            </div>
          </div>
          
          {/* Pricing and Discount Section */}
          <div className="border dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-700">Pricing and Discount</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <input
                    type="checkbox"
                    name="vatEnable"
                    checked={editFormData.vatEnable || false}
                    onChange={handleInputChange}
                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span>VAT Enabled</span>
                </label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      VAT Type
                    </label>
                    <select
                      name="vatType"
                      value={editFormData.vatType || ''}
                      onChange={handleInputChange}
                      disabled={!editFormData.vatEnable}
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    >
                      <option value="Percentage">Percentage</option>
                      <option value="Fixed">Fixed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      VAT Amount
                    </label>
                    <input
                      type="number"
                      name="vatAmount"
                      value={editFormData.vatAmount || 0}
                      onChange={handleInputChange}
                      disabled={!editFormData.vatEnable}
                      min="0"
                      step="0.01"
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Type
                    </label>
                    <select
                      name="discountType"
                      value={editFormData.discountType || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="Percentage">Percentage</option>
                      <option value="Fixed">Fixed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discount Rate
                    </label>
                    <input
                      type="number"
                      name="discountRate"
                      value={editFormData.discountRate || 0}
                      onChange={handleInputChange}
                      min="0"
                      max={editFormData.discountType === 'Percentage' ? 100 : undefined}
                      step="0.01"
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="border dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-700">Additional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Warranty
                </label>
                <textarea
                  name="warranty"
                  value={editFormData.warranty || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Safety Warnings
                </label>
                <textarea
                  name="safetyWarnings"
                  value={editFormData.safetyWarnings || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={editFormData.featured || false}
                      onChange={handleInputChange}
                      className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span>Featured Product</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      name="status"
                      checked={editFormData.status || false}
                      onChange={handleInputChange}
                      className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Inventory Information */}
          <div className="border dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-700">Inventory Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reorder Number
                </label>
                <input
                  type="number"
                  name="reorderNumber"
                  value={editFormData.reorderNumber || 0}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rack ID
                </label>
                <input
                  type="number"
                  name="rackId"
                  value={editFormData.rackId || 0}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cell ID
                </label>
                <input
                  type="number"
                  name="cellId"
                  value={editFormData.cellId || 0}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          {/* SEO Information */}
          <div className="border dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-700">SEO Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="seo.metaTitle"
                  value={editFormData?.seo?.metaTitle || ''}
                  onChange={(e) => {
                    setEditFormData(prev => ({
                      ...prev,
                      seo: {
                        ...prev.seo,
                        metaTitle: e.target.value
                      }
                    }));
                  }}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Description
                </label>
                <textarea
                  name="seo.metaDescription"
                  value={editFormData?.seo?.metaDescription || ''}
                  onChange={(e) => {
                    setEditFormData(prev => ({
                      ...prev,
                      seo: {
                        ...prev.seo,
                        metaDescription: e.target.value
                      }
                    }));
                  }}
                  rows={3}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  name="seo.metaKeywords"
                  value={editFormData?.seo?.metaKeywords || ''}
                  onChange={(e) => {
                    setEditFormData(prev => ({
                      ...prev,
                      seo: {
                        ...prev.seo,
                        metaKeywords: e.target.value
                      }
                    }));
                  }}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  name="seo.canonicalURL"
                  value={editFormData?.seo?.canonicalURL || ''}
                  onChange={(e) => {
                    setEditFormData(prev => ({
                      ...prev,
                      seo: {
                        ...prev.seo,
                        canonicalURL: e.target.value
                      }
                    }));
                  }}
                  className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Specifications */}
          <div className="border dark:border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:border-gray-700">Specifications</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Parameter</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {product.specifications.map((spec, index) => (
                    <tr key={spec.specificationId}>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {spec.paramName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {spec.paramValue}
                      </td>
                    </tr>
                  ))}
                  {product.specifications.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                        No specifications available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              To edit specifications, please use the dedicated specifications editor on the full edit page.
            </p>
          </div>
          
          {/* Submit button at the bottom for convenience */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center ${
                saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-6 py-3 rounded-md`}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving Changes...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Image */}
          <div className="lg:w-1/3">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              {!product.thumbnail || !isValidImageUrl(product.thumbnail) ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-6xl font-medium">
                    {product.productName ? product.productName.charAt(0).toUpperCase() : 'P'}
                  </span>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={product.thumbnail}
                    alt={product.productName || "Product thumbnail"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>

            {/* Product ID and Status */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center">
                <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
                <span className="text-sm text-gray-500 dark:text-gray-400">ID: {product.productId}</span>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                product.status 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {product.status ? "Active" : "Inactive"}
              </div>
            </div>

            {/* Additional images if available */}
            {Array.isArray(product.images) && product.images.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Images</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => {
                    const imageUrl = image.imageUrl || image.url;
                    return (
                      <div key={image.imageId || index} className="aspect-square relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {!imageUrl || !isValidImageUrl(imageUrl) ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                              {index + 1}
                            </span>
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            <Image
                              src={imageUrl}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Specifications */}
            {Array.isArray(product.specifications) && product.specifications.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <List className="w-4 h-4 mr-2" />
                  Specifications
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-md overflow-hidden">
                  <table className="min-w-full">
                    <tbody className="divide-y dark:divide-gray-600">
                      {product.specifications.map((spec) => (
                        <tr key={spec.specificationId}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {spec.paramName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                            {spec.paramValue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="lg:w-2/3">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{product.productName}</h1>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center">
                <Tag className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Barcode</p>
                  <p className="font-medium">{product.barcode}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Box className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  <p className="font-medium">{product.categoryName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Box className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sub Category</p>
                  <p className="font-medium">{product.subCategoryName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expiry Date</p>
                  <p className="font-medium">
                    {product.expiredDate ? new Date(product.expiredDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Percent className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Discount</p>
                  <p className="font-medium">
                    {product.discountRate}% ({product.discountType})
                  </p>
                </div>
              </div>
              
              {product.vatEnable && (
                <div className="flex items-center">
                  <BarChart className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">VAT</p>
                    <p className="font-medium">
                      {product.vatAmount} ({product.vatType})
                    </p>
                  </div>
                </div>
              )}
              
              {product.featured && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <div>
                    <p className="font-medium">Featured Product</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Slug</p>
                  <p className="font-medium">{product.slug}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Package className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reorder Number</p>
                  <p className="font-medium">{product.reorderNumber || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Bookmark className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Brand ID</p>
                  <p className="font-medium">{product.brandId || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                {product.status ? (
                  <ToggleRight className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <ToggleLeft className="w-5 h-5 text-red-500 mr-2" />
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`font-medium ${product.status ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {product.status ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Description
              </h2>
              <div className="prose dark:prose-invert max-w-none border-t pt-3 dark:border-gray-700">
                {product.productDescription ? (
                  <div 
                    className="text-gray-700 dark:text-gray-300" 
                    dangerouslySetInnerHTML={{ __html: product.productDescription }}
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No description available</p>
                )}
              </div>
            </div>

            {/* Safety and warranty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t pt-6 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Warranty
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{product.warranty || 'N/A'}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Safety Warnings
                </h2>
                <p className="text-gray-700 dark:text-gray-300">{product.safetyWarnings || 'N/A'}</p>
              </div>
            </div>
            
            {/* Inventory */}
            <div className="mt-8 border-t pt-6 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Inventory Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rack ID</p>
                  <p className="font-medium">{product.rackId || 'Not assigned'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cell ID</p>
                  <p className="font-medium">{product.cellId || 'Not assigned'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Unit ID</p>
                  <p className="font-medium">{product.unitId || 'Not assigned'}</p>
                </div>
              </div>
            </div>
            
            {/* SEO Information */}
            {product.seo && (
              <div className="mt-8 border-t pt-6 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  SEO Information
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Meta Title</p>
                    <p className="font-medium">{product.seo.metaTitle || 'Not set'}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Meta Description</p>
                    <p className="text-sm">{product.seo.metaDescription || 'Not set'}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Meta Keywords</p>
                    <p className="text-sm">{product.seo.metaKeywords || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Canonical URL</p>
                    <p className="text-sm break-all">{product.seo.canonicalURL || 'Not set'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Add the media gallery component here */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" /> {/* Make sure to import ImageIcon */}
                Product Media
              </h2>
              <MediaGallery product={product} />
            </div>

            {/* Admin actions */}
            <div className="flex items-center mt-8 pt-6 border-t dark:border-gray-700">
              <Link 
                href={`/admin/products/edit/${product.productId}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md mr-4"
              >
                Go to Full Edit Page
              </Link>
              <Link 
                href="/admin/products" 
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-md"
              >
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}