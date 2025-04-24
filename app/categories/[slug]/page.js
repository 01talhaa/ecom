"use client"

import { useState, useEffect, Suspense, useCallback } from "react" // Add useCallback
import { useParams } from "next/navigation"
import { getCategories, getProducts, getBrands } from "@/lib/api"
import ProductGrid from "@/components/products/ProductGrid"
import ProductFilter from "@/components/products/ProductFilter"
import { notFound } from "next/navigation"

function CategoryContent() {
  const params = useParams()
  const { slug } = params

  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const categoriesData = await getCategories()
      const categoryData = categoriesData.find((cat) => cat.slug === slug)

      if (!categoryData) {
        notFound()
        return
      }

      const productsData = await getProducts()
      const categoryProducts = productsData.filter((product) => product.CategoryId === categoryData.id)
      const brandsData = await getBrands()

      setCategory(categoryData)
      setCategories(categoriesData)
      setProducts(categoryProducts)
      setFilteredProducts(categoryProducts)
      setBrands(brandsData)
      setLoading(false)
    }

    fetchData()
  }, [slug])

  const handleFilterChange = useCallback((filters) => {
    let result = [...products]

    // Filter by brands
    if (filters.brands.length > 0) {
      result = result.filter((product) => filters.brands.includes(product.BrandId))
    }

    // Filter by price range
    result = result.filter(
      (product) => product.DiscountedPrice >= filters.priceRange[0] && product.DiscountedPrice <= filters.priceRange[1],
    )

    // Filter by availability
    if (filters.availability.inStock && !filters.availability.outOfStock) {
      result = result.filter((product) => product.StockQuantity > 0)
    } else if (!filters.availability.inStock && filters.availability.outOfStock) {
      result = result.filter((product) => product.StockQuantity <= 0)
    }

    setFilteredProducts(result)
  }, [products]); // Add products as a dependency

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/4 bg-gray-200 h-96 rounded"></div>
            <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{category.name}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <ProductFilter categories={categories} brands={brands} onFilterChange={handleFilterChange} />
        </div>

        <div className="w-full md:w-3/4">
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium text-gray-600">No products found with the selected filters</h2>
              <p className="mt-2 text-gray-500">Try adjusting your filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading category...</div>}>
      <CategoryContent />
    </Suspense>
  )
}

