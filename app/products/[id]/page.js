"use client"

import { useState, useEffect, useRef } from "react" // Added useRef
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { toast } from "react-hot-toast" // Make sure to install this: npm install react-hot-toast
import { Heart, Share2, ShoppingCart, Truck, RotateCcw, Shield, Star, ChevronRight, Info, MinusCircle, PlusCircle, ArrowLeft, ZoomIn, ZoomOut, X } from "lucide-react"

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('specifications')
  const [zoomLevel, setZoomLevel] = useState(1) // For managing zoom level
  const [isZoomed, setIsZoomed] = useState(false) // Track if image is zoomed
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 }) // Track cursor position
  const imageContainerRef = useRef(null) // Reference to image container
  const params = useParams()
  const { getAuthToken } = useAuth()
  const { addToCart, isLoading: cartLoading } = useCart()
  const [addingToCart, setAddingToCart] = useState(false)
  const productId = params.id

  console.log("Product ID from route:", productId)

  // Fetch product details
  useEffect(() => {
    async function fetchProductDetails() {
      if (!productId) {
        setError("Missing product ID")
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log("Fetching product with ID:", productId)
        const token = getAuthToken()
        
        if (!token) {
          throw new Error("Authentication token is missing")
        }

        let response;
        
        // Check if the productId is numeric or a slug
        if (!isNaN(productId) && parseInt(productId) > 0) {
          // If it's a numeric ID, fetch directly
          response = await fetch(`/api/proxy/api/v1/viewpage/${productId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        } else {
          // If it's a slug, first fetch all products to find the matching product ID
          const allProductsResponse = await fetch(`/api/proxy/api/v1/viewpage`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (!allProductsResponse.ok) {
            throw new Error(`API error: ${allProductsResponse.status}`)
          }
          
          const allProductsData = await allProductsResponse.json()
          
          if (!allProductsData.success) {
            throw new Error("Failed to fetch products list")
          }
          
          // Find the product with matching slug
          const matchingProduct = allProductsData.data.result?.find(
            p => p.slug === productId || p.productName === productId
          )
          
          if (!matchingProduct) {
            throw new Error("Product not found")
          }
          
          // Now fetch the specific product using its numeric ID
          response = await fetch(`/api/proxy/api/v1/viewpage/${matchingProduct.productId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Product details response:", data)

        if (data.success && data.data) {
          const productData = data.data
          setProduct(productData)
          // Set the first image as selected by default
          if (productData.thumbnail) {
            setSelectedImage(productData.thumbnail)
          } else if (productData.images && productData.images.length > 0) {
            setSelectedImage(productData.images[0].imageUrl)
          }
        } else {
          throw new Error("Failed to fetch product details")
        }
      } catch (err) {
        console.error("Error fetching product details:", err)
        setError(err.message || "Failed to load product details")
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [productId, getAuthToken])

  // Calculate discounted price if not provided directly
  const calculateDiscountedPrice = (product) => {
    if (!product) return 0
    
    if (product.discountedPrice) return product.discountedPrice
    
    if (product.originalPrice && product.discountRate) {
      if (product.discountType === 'Percentage') {
        return product.originalPrice - (product.originalPrice * (product.discountRate / 100))
      } else {
        return product.originalPrice - product.discountRate
      }
    }
    return product.originalPrice || 0
  }

  // Handle quantity changes
  const incrementQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(prev => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    
    try {
      const result = await addToCart(product, quantity)
      
      if (result.success) {
        toast.success(`${product.productName} added to cart!`)
      } else {
        toast.error(result.message || "Failed to add to cart")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Error adding to cart. Please try again.")
    } finally {
      setAddingToCart(false)
    }
  }

  // Handle add to wishlist
  const handleAddToWishlist = () => {
    if (!product) return
    // Add your wishlist logic here
    console.log(`Added ${product.productName} to wishlist`)
  }

  // Handle image zoom
  const handleImageZoom = (e) => {
    if (!imageContainerRef.current || !isZoomed) return;
    
    // Get container dimensions
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    
    // Calculate relative cursor position within the image container (0 to 1)
    const relativeX = Math.max(0, Math.min(1, (e.clientX - left) / width));
    const relativeY = Math.max(0, Math.min(1, (e.clientY - top) / height));
    
    // Set position for the zoomed image
    setZoomPosition({ x: relativeX, y: relativeY });
  };

  // Toggle zoom mode
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed) {
      setZoomLevel(2.5); // Default zoom level when activating
    }
  };

  // Adjust zoom level
  const adjustZoom = (increment) => {
    setZoomLevel(prevZoom => {
      const newZoom = prevZoom + (increment ? 0.5 : -0.5);
      return Math.max(1, Math.min(4, newZoom)); // Limit zoom between 1x and 4x
    });
  };

  // Handle image mouse leave
  const handleMouseLeave = () => {
    if (isZoomed) {
      // Reset zoom position when mouse leaves
      setZoomPosition({ x: 0.5, y: 0.5 });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <h2 className="text-red-800 dark:text-red-400 text-lg font-medium mb-2">Error Loading Product</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Link href="/products" className="inline-flex items-center mt-4 text-blue-600 dark:text-blue-400">
            <ArrowLeft className="w-4 h-4 mr-1" /> Return to products
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
          <h2 className="text-yellow-800 dark:text-yellow-400 text-lg font-medium mb-2">Product Not Found</h2>
          <p className="text-yellow-700 dark:text-yellow-300">We couldn't find the product you're looking for.</p>
          <Link href="/products" className="inline-flex items-center mt-4 text-blue-600 dark:text-blue-400">
            <ArrowLeft className="w-4 h-4 mr-1" /> Return to products
          </Link>
        </div>
      </div>
    )
  }

  const discountedPrice = calculateDiscountedPrice(product)
  const hasDiscount = product.discountRate > 0
  const inStock = product.stockQuantity > 0

  // Calculate stock status for display
  const stockStatus = () => {
    if (!inStock) return { text: "Out of Stock", color: "text-red-500" }
    if (product.stockQuantity <= 5) return { text: "Low Stock", color: "text-orange-500" }
    return { text: "In Stock", color: "text-green-500" }
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-10">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <Link href="/products" className="ml-1 text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                Products
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <Link href={`/products?category=${product.categoryId}`} className="ml-1 text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-500">
                {product.categoryName}
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <span className="ml-1 text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-xs">
                {product.productName}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images with Zoom Feature */}
        <div className="space-y-4">
          <div 
            ref={imageContainerRef}
            className={`relative aspect-square rounded-lg overflow-hidden 
              ${isZoomed ? 'cursor-zoom-out bg-gray-100 dark:bg-gray-800' : 'cursor-zoom-in bg-white dark:bg-gray-800'}`}
            onClick={toggleZoom}
            onMouseMove={handleImageZoom}
            onMouseLeave={handleMouseLeave}
          >
            {/* Main product image */}
            <div className={`relative w-full h-full transition-transform duration-200 ${isZoomed ? 'scale-110' : ''}`}>
              <Image
                src={selectedImage || '/placeholder-image.jpg'}
                alt={product.productName}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-contain transition-all`}
                priority
                style={{
                  transformOrigin: isZoomed ? `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%` : 'center center',
                  transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
                }}
              />
            </div>

            {/* Overlay zoom controls */}
            {isZoomed && (
              <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-lg shadow-lg flex items-center space-x-2 text-gray-800 dark:text-white">
                <button 
                  onClick={(e) => { e.stopPropagation(); adjustZoom(false); }} 
                  disabled={zoomLevel <= 1}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium">{zoomLevel.toFixed(1)}×</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); adjustZoom(true); }}
                  disabled={zoomLevel >= 4}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Zoom indicator when not zoomed */}
            {!isZoomed && (
              <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-full shadow-lg text-gray-800 dark:text-white">
                <ZoomIn className="w-4 h-4" />
              </div>
            )}
  
            {product.featured && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                Featured
              </div>
            )}
            
            {hasDiscount && (
              <div className="absolute top-2 left-2 ml-20 bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                {product.discountRate}% OFF
              </div>
            )}
          </div>
          
          {/* Image Gallery - now with active state styling */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {/* Main thumbnail */}
            <button 
              className={`relative w-16 h-16 rounded ${selectedImage === product.thumbnail 
                ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' 
                : 'border border-gray-200 dark:border-gray-700'} overflow-hidden flex-shrink-0 transition-all`}
              onClick={() => setSelectedImage(product.thumbnail)}
            >
              <Image 
                src={product.thumbnail || '/placeholder-image.jpg'} 
                alt="Main product image"
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
            
            {/* Other product images */}
            {product.images && product.images.length > 0 && product.images.map((image, index) => (
              <button 
                key={image.imageId || index}
                className={`relative w-16 h-16 rounded ${selectedImage === image.imageUrl 
                  ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' 
                  : 'border border-gray-200 dark:border-gray-700'} overflow-hidden flex-shrink-0 transition-all`}
                onClick={() => setSelectedImage(image.imageUrl)}
              >
                <Image 
                  src={image.imageUrl || '/placeholder-image.jpg'} 
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          
          {/* Image navigation guidance */}
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            Click on an image to select. Click main image to zoom in/out.
          </div>
        </div>
        
        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Link 
                href={`/products?category=${product.categoryId}`}
                className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md"
              >
                {product.categoryName}
              </Link>
              {product.brandName && (
                <Link 
                  href={`/products?brand=${product.brandId}`}
                  className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-md"
                >
                  {product.brandName}
                </Link>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.productName}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              {/* Ratings */}
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.round(product.ratings) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300 dark:text-gray-600'}`} 
                    />
                  ))}
                </div>
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  ({product.ratings || 0})
                </span>
              </div>
              
              {/* Likes */}
              <div className="flex items-center">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {product.likesCount || 0}
                </span>
              </div>
            </div>
            
            {/* Price */}
            <div className="flex items-end gap-2 mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${discountedPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {hasDiscount && (
                <span className="text-sm bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-md">
                  Save ${(product.originalPrice - discountedPrice).toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="flex items-center mb-6">
              <span className={`text-sm font-medium ${stockStatus().color}`}>
                {stockStatus().text}
              </span>
              {inStock && (
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  ({product.stockQuantity} available)
                </span>
              )}
            </div>
            
            {/* Description */}
            <div 
              className="prose prose-sm dark:prose-invert mb-6" 
              dangerouslySetInnerHTML={{ __html: product.productDescription }}
            />
            
            {/* Purchase Actions */}
            {inStock ? (
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center">
                  <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                    <button 
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center">{quantity}</span>
                    <button 
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stockQuantity}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={addingToCart || cartLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex justify-center items-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleAddToWishlist}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                  </button>
                  <button 
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-blue-500" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md flex items-start">
                  <Info className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-400">Out of Stock</p>
                    <p className="text-sm text-red-700 dark:text-red-300">This product is currently unavailable.</p>
                  </div>
                </div>
                <button 
                  onClick={handleAddToWishlist}
                  className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-md transition-colors"
                >
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Add to Wishlist
                </button>
              </div>
            )}
            
            {/* Product Meta */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <dl className="space-y-3 text-sm">
                {product.barcode && (
                  <div className="flex items-center">
                    <dt className="w-24 flex-shrink-0 text-gray-500 dark:text-gray-400">SKU/Barcode:</dt>
                    <dd className="text-gray-900 dark:text-gray-100">{product.barcode}</dd>
                  </div>
                )}
                <div className="flex items-center">
                  <dt className="w-24 flex-shrink-0 text-gray-500 dark:text-gray-400">Category:</dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    <Link href={`/products?category=${product.categoryId}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {product.categoryName}
                    </Link>
                  </dd>
                </div>
                {product.subCategoryName && (
                  <div className="flex items-center">
                    <dt className="w-24 flex-shrink-0 text-gray-500 dark:text-gray-400">Subcategory:</dt>
                    <dd className="text-gray-900 dark:text-gray-100">
                      <Link href={`/products?subcategory=${product.subCategoryId}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {product.subCategoryName}
                      </Link>
                    </dd>
                  </div>
                )}
                {product.brandName && (
                  <div className="flex items-center">
                    <dt className="w-24 flex-shrink-0 text-gray-500 dark:text-gray-400">Brand:</dt>
                    <dd className="text-gray-900 dark:text-gray-100">
                      <Link href={`/products?brand=${product.brandId}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                        {product.brandName}
                      </Link>
                    </dd>
                  </div>
                )}
                {product.unitName && (
                  <div className="flex items-center">
                    <dt className="w-24 flex-shrink-0 text-gray-500 dark:text-gray-400">Unit:</dt>
                    <dd className="text-gray-900 dark:text-gray-100">{product.unitName}</dd>
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex items-center">
                    <dt className="w-24 flex-shrink-0 text-gray-500 dark:text-gray-400">Tags:</dt>
                    <dd className="flex flex-wrap gap-1">
                      {product.tags.map(tag => (
                        <Link 
                          key={tag.tagId} 
                          href={`/products?tag=${tag.tagId}`} 
                          className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          {tag.tagName}
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <div className="w-full border-b border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex flex-wrap -mb-px">
            <button 
              onClick={() => setActiveTab('specifications')}
              className={`inline-block py-3 px-4 text-sm font-medium ${activeTab === 'specifications' 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Specifications
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              className={`inline-block py-3 px-4 text-sm font-medium ${activeTab === 'details' 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Details
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`inline-block py-3 px-4 text-sm font-medium ${activeTab === 'reviews' 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('faq')}
              className={`inline-block py-3 px-4 text-sm font-medium ${activeTab === 'faq' 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              FAQ
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {activeTab === 'specifications' && (
            <>
              {product.specifications && product.specifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.map((spec, index) => (
                    <div key={spec.specificationId || index} className="flex">
                      <dt className="w-1/3 font-medium text-gray-700 dark:text-gray-300">{spec.name}:</dt>
                      <dd className="w-2/3 text-gray-600 dark:text-gray-400">{spec.value}</dd>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No specifications available for this product.</p>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'details' && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: product.productDescription }} />
              
              {product.warranty && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Warranty Information</h3>
                  <div dangerouslySetInnerHTML={{ __html: product.warranty }} />
                </div>
              )}
              
              {product.safetyWarnings && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Safety Warnings</h3>
                  <div dangerouslySetInnerHTML={{ __html: product.safetyWarnings }} />
                </div>
              )}
              
              {!product.productDescription && !product.warranty && !product.safetyWarnings && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-6">No additional details available for this product.</p>
              )}
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <>
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.reviewId} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="font-medium text-gray-800 dark:text-white">
                            {review.userName || "Anonymous User"}
                          </div>
                          <span className="mx-2 text-gray-400">•</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className={`w-3 h-3 ${i < review.rating 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300 dark:text-gray-600'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                        {review.title || "Review"}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No reviews yet</p>
                  <button 
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Be the first to write a review
                  </button>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'faq' && (
            <>
              {product.faqs && product.faqs.length > 0 ? (
                <div className="space-y-4">
                  {product.faqs.map((faq) => (
                    <div key={faq.faqId} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No frequently asked questions available for this product.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Shipping & Return Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-start">
          <Truck className="w-10 h-10 text-blue-600 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Free Shipping</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              On orders over $50. Standard shipping takes 3-5 business days.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-start">
          <RotateCcw className="w-10 h-10 text-blue-600 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Easy Returns</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Return or exchange within 30 days from purchase date.
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-start">
          <Shield className="w-10 h-10 text-blue-600 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Secure Checkout</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your payment information is processed securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}