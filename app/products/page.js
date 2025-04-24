"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import ProductFilter from "@/components/products/ProductFilter"
import ProductGrid from "@/components/products/ProductGrid"
import { useAuth } from "@/context/AuthContext" // Import for auth token

function ProductsContent() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('grid')
  const [sortOption, setSortOption] = useState('featured')
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 1
  })
  const { getAuthToken } = useAuth()

  // Extract unique categories and brands from products
  const extractMetadata = useCallback((productsData) => {
    const uniqueCategories = [];
    const categoryIds = new Set();
    const uniqueBrands = [];
    const brandIds = new Set();

    productsData.forEach(product => {
      // Extract categories
      if (product.categoryId && !categoryIds.has(product.categoryId)) {
        categoryIds.add(product.categoryId);
        uniqueCategories.push({
          id: product.categoryId,
          name: product.categoryName || 'Unknown Category'
        });
      }
      
      // Extract brands
      if (product.brandId && !brandIds.has(product.brandId)) {
        brandIds.add(product.brandId);
        uniqueBrands.push({
          id: product.brandId,
          name: product.brandName || 'Unknown Brand'
        });
      }
    });

    return { uniqueCategories, uniqueBrands };
  }, []);

  useEffect(() => {
    async function fetchProductData() {
      setLoading(true);
      try {
        const token = getAuthToken();
        
        if (!token) {
          console.error("Authentication token is missing");
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/proxy/api/v1/viewpage', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Products API Response:", data);
        
        if (data.success && data.data && Array.isArray(data.data.result)) {
          const productsData = data.data.result;
          
          // Store products with processed data
          const processedProducts = productsData.map(product => ({
            ...product,
            // Ensure discountedPrice is calculated if not provided
            discountedPrice: product.discountedPrice || calculateDiscountedPrice(product)
          }));
          
          setProducts(processedProducts);
          setFilteredProducts(processedProducts);
          
          // Extract unique categories and brands
          const { uniqueCategories, uniqueBrands } = extractMetadata(processedProducts);
          setCategories(uniqueCategories);
          setBrands(uniqueBrands);
          
          // Set pagination data
          if (data.data.meta) {
            setPagination(data.data.meta);
          }
        } else {
          console.warn("API returned success but no result array was found", data);
          setProducts([]);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProductData();
  }, [extractMetadata, getAuthToken]);

  // Calculate discounted price if not provided directly
  const calculateDiscountedPrice = (product) => {
    if (product.originalPrice && product.discountRate) {
      if (product.discountType === 'Percentage') {
        return product.originalPrice - (product.originalPrice * (product.discountRate / 100));
      } else {
        return product.originalPrice - product.discountRate;
      }
    }
    return product.originalPrice || 0;
  };

  const handleFilterChange = useCallback((filters) => {
    let result = [...products]

    // Filter by categories
    if (filters.categories.length > 0) {
      result = result.filter((product) => filters.categories.includes(product.categoryId))
    }

    // Filter by brands
    if (filters.brands.length > 0) {
      result = result.filter((product) => filters.brands.includes(product.brandId))
    }

    // Filter by price range
    result = result.filter(
      (product) => {
        const price = product.discountedPrice || calculateDiscountedPrice(product);
        return price >= filters.priceRange[0] && price <= filters.priceRange[1]
      }
    )

    // Filter by availability
    if (filters.availability.inStock && !filters.availability.outOfStock) {
      result = result.filter((product) => product.stockQuantity > 0)
    } else if (!filters.availability.inStock && filters.availability.outOfStock) {
      result = result.filter((product) => product.stockQuantity <= 0)
    }

    setFilteredProducts(result)
  }, [products]);

  const handleSort = useCallback((option) => {
    setSortOption(option)
    let sorted = [...filteredProducts]

    switch (option) {
      case 'price-asc':
        sorted.sort((a, b) => (a.discountedPrice || calculateDiscountedPrice(a)) - (b.discountedPrice || calculateDiscountedPrice(b)))
        break
      case 'price-desc':
        sorted.sort((a, b) => (b.discountedPrice || calculateDiscountedPrice(b)) - (a.discountedPrice || calculateDiscountedPrice(a)))
        break
      case 'name-asc':
        sorted.sort((a, b) => a.productName.localeCompare(b.productName))
        break
      case 'newest':
        // Since we don't have a creation date, use product ID as a proxy for recency
        sorted.sort((a, b) => b.productId - a.productId)
        break
      case 'popular':
        // Use salesCount as a proxy for popularity 
        sorted.sort((a, b) => b.salesCount - a.salesCount)
        break
      case 'rating':
        sorted.sort((a, b) => b.ratings - a.ratings)
        break
      default: // 'featured'
        // Show featured products first
        sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    setFilteredProducts(sorted)
  }, [filteredProducts]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">All Products</h1>
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
            ))}
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded my-4 animate-pulse"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
            ))}
          </div>
          
          <div className="w-full md:w-3/4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-md mb-4"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-5">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg shadow-lg mb-8 p-8 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">All Products</h1>
        <p className="text-blue-100">Discover our wide selection of high-quality products</p>
        <div className="flex flex-wrap gap-3 mt-4">
          {categories.slice(0, 5).map((category) => (
            <span key={category.id} className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              {category.name}
            </span>
          ))}
          {categories.length > 5 && (
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              +{categories.length - 5} more
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Mobile filter toggle */}
        <div className="md:hidden w-full mb-4">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {/* Filters */}
        <div className={`w-full md:w-1/4 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 sticky top-20">
            <ProductFilter categories={categories} brands={brands} onFilterChange={handleFilterChange} />
          </div>
        </div>

        {/* Products section */}
        <div className="w-full md:w-3/4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <p className="text-gray-600 dark:text-gray-300">
                Showing <span className="font-semibold">{filteredProducts.length}</span> products
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="sort" className="sr-only">Sort by</label>
                <select
                  id="sort"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={sortOption}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
              
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <button
                  className={`p-2 ${activeView === 'grid' ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}
                  onClick={() => setActiveView('grid')}
                  aria-label="Grid view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  className={`p-2 ${activeView === 'list' ? 'bg-indigo-500 text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}
                  onClick={() => setActiveView('list')}
                  aria-label="List view"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} viewMode={activeView} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find any products matching your current filters. Try adjusting your filter criteria.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">Loading products...</p>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}