"use client"

import { useState, useEffect } from "react"

export default function ProductFilter({ categories, brands, onFilterChange }) {
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [inStock, setInStock] = useState(false)
  const [outOfStock, setOutOfStock] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    availability: true
  })

  // Update filters when any filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        categories: selectedCategories,
        brands: selectedBrands,
        priceRange,
        availability: {
          inStock,
          outOfStock,
        },
      })
    }
  }, [selectedCategories, selectedBrands, priceRange, inStock, outOfStock, onFilterChange])

  const handleCategoryChange = (id) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]))
  }

  const handleBrandChange = (id) => {
    setSelectedBrands((prev) => (prev.includes(id) ? prev.filter((brandId) => brandId !== id) : [...prev, id]))
  }

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange]
    newRange[index] = Number.parseInt(e.target.value)
    setPriceRange(newRange)
  }

  const handleReset = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([0, 500])
    setInStock(false)
    setOutOfStock(false)
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const activeFiltersCount = selectedCategories.length + selectedBrands.length + (inStock || outOfStock ? 1 : 0)

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {/* Filter Header with Reset Button */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        {activeFiltersCount > 0 && (
          <button 
            onClick={handleReset}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset all
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="py-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active filters:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(catId => {
              const category = categories.find(c => c.id === catId)
              return category && (
                <span key={`cat-${catId}`} className="inline-flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full px-2 py-1 text-xs">
                  {category.name}
                  <button 
                    onClick={() => handleCategoryChange(catId)}
                    className="ml-1 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )
            })}
            
            {selectedBrands.map(brandId => {
              const brand = brands.find(b => b.id === brandId)
              return brand && (
                <span key={`brand-${brandId}`} className="inline-flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full px-2 py-1 text-xs">
                  {brand.name}
                  <button 
                    onClick={() => handleBrandChange(brandId)}
                    className="ml-1 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )
            })}
            
            {(inStock || outOfStock) && (
              <span className="inline-flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full px-2 py-1 text-xs">
                {inStock && outOfStock ? "All items" : inStock ? "In stock" : "Out of stock"}
                <button 
                  onClick={() => { setInStock(false); setOutOfStock(false); }}
                  className="ml-1 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Categories Filter Section */}
      <div className="py-4">
        <button 
          className="flex items-center justify-between w-full text-left"
          onClick={() => toggleSection('categories')}
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Categories</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transition-transform ${expandedSections.categories ? 'transform rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.categories && (
          <div className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  id={`category-${category.id}`}
                  name={`category-${category.id}`}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center justify-between w-full"
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{category.count || 0}</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brands Filter Section */}
      <div className="py-4">
        <button 
          className="flex items-center justify-between w-full text-left"
          onClick={() => toggleSection('brands')}
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Brands</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transition-transform ${expandedSections.brands ? 'transform rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.brands && (
          <div className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-2 custom-scrollbar">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center">
                <input
                  id={`brand-${brand.id}`}
                  name={`brand-${brand.id}`}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleBrandChange(brand.id)}
                />
                <label
                  htmlFor={`brand-${brand.id}`}
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center justify-between w-full"
                >
                  <span>{brand.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{brand.count || 0}</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="py-4">
        <button 
          className="flex items-center justify-between w-full text-left"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Price Range</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transition-transform ${expandedSections.price ? 'transform rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.price && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label htmlFor="min-price" className="text-xs text-gray-600 dark:text-gray-400">Min</label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="min-price"
                    className="pl-7 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    min="0"
                    max={priceRange[1]}
                  />
                </div>
              </div>
              <div className="mx-2 text-gray-500">—</div>
              <div>
                <label htmlFor="max-price" className="text-xs text-gray-600 dark:text-gray-400">Max</label>
                <div className="mt-1 relative rounded-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="max-price"
                    className="pl-7 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="500"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    min={priceRange[0]}
                  />
                </div>
              </div>
            </div>

            <div className="px-1">
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer range-slider"
              />
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer range-slider -mt-1"
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-indigo-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Current range:</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">${priceRange[0]} - ${priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="py-4">
        <button 
          className="flex items-center justify-between w-full text-left"
          onClick={() => toggleSection('availability')}
        >
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Availability</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transition-transform ${expandedSections.availability ? 'transform rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSections.availability && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                id="in-stock"
                name="in-stock"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                checked={inStock}
                onChange={() => setInStock(!inStock)}
              />
              <label htmlFor="in-stock" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                In Stock
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="out-of-stock"
                name="out-of-stock"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                checked={outOfStock}
                onChange={() => setOutOfStock(!outOfStock)}
              />
              <label htmlFor="out-of-stock" className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Out of Stock
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Apply Button - Mobile Only */}
      <div className="pt-4 md:hidden">
        <button
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow transition-colors"
          onClick={() => document.dispatchEvent(new CustomEvent('close-filters'))}
        >
          Apply Filters
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #374151;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        }
      `}</style>
    </div>
  )
}