"use client"

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePCBuilder } from "@/context/PCBuilderContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SelectComponentPage() {
  const router = useRouter();
  const params = useParams();
  const componentSlug = params.component;
  
  const {
    components,
    products,
    selectComponent,
  } = usePCBuilder();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // For mobile toggle

  // Find matching component keys - try a few different case combinations
  const categoryKey = Object.keys(components).find(
    key => key.toLowerCase() === componentSlug.toLowerCase()
  );

  const componentCategory = categoryKey ? components[categoryKey] : null;
  const componentProducts = categoryKey ? products[categoryKey] : [];

  // Extract all available brands and features for this component category
  const availableBrands = useMemo(() => {
    if (!componentProducts || !componentProducts.length) return [];
    
    const brands = componentProducts.map(product => {
      // Extract brand from product name (assuming format like "ASUS ROG..." or "Intel Core...")
      const nameParts = product.name.split(' ');
      return nameParts[0]; // Take first word as brand
    });
    
    return [...new Set(brands)]; // Remove duplicates
  }, [componentProducts]);

  // Extract key features based on component type
  const availableFeatures = useMemo(() => {
    if (!componentProducts || !componentProducts.length || !categoryKey) return [];
    
    // Different features for different component types
    switch(categoryKey) {
      case 'CPU':
        return ['8+ Cores', '4.0+ GHz', 'Integrated Graphics', 'Unlocked'];
      case 'GPU':
        return ['8+ GB VRAM', 'Ray Tracing', 'DLSS/FSR Support', 'Low Profile'];
      case 'RAM':
        return ['RGB', '3200+ MHz', 'Low Latency', '32+ GB'];
      case 'STORAGE':
        return ['NVMe', 'SSD', 'HDD', '1+ TB'];
      case 'MOTHERBOARD':
        return ['WiFi', 'Bluetooth', 'RGB Headers', 'Multiple M.2 Slots'];
      case 'PSU':
        return ['80+ Gold', '80+ Platinum', 'Fully Modular', '750W+'];
      case 'CASE':
        return ['Tempered Glass', 'RGB', 'ATX', 'Micro-ATX'];
      case 'COOLER':
        return ['AIO', 'RGB', 'Low Profile', '240mm+'];
      default:
        return [];
    }
  }, [categoryKey, componentProducts]);

  // Determine price range based on available products
  useEffect(() => {
    if (componentProducts && componentProducts.length > 0) {
      const prices = componentProducts.map(p => p.price);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      setPriceRange([minPrice, maxPrice]);
    }
  }, [componentProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!componentProducts || !componentProducts.length) return [];

    let result = [...componentProducts];

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by price
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by selected brands
    if (selectedBrands.length > 0) {
      result = result.filter(product => {
        const productBrand = product.name.split(' ')[0]; // Extract brand from name
        return selectedBrands.includes(productBrand);
      });
    }

    // Filter by selected features
    if (selectedFeatures.length > 0) {
      result = result.filter(product => {
        // Check if product specs contain any of the selected features
        return selectedFeatures.some(feature => 
          product.specs && product.specs.toLowerCase().includes(feature.toLowerCase())
        );
      });
    }

    // Sort products
    switch (sortBy) {
      case "price-asc":
        return result.sort((a, b) => a.price - b.price);
      case "price-desc":
        return result.sort((a, b) => b.price - a.price);
      case "name-asc":
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return result.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return result; // Default sorting (recommended)
    }
  }, [componentProducts, searchQuery, sortBy, priceRange, selectedBrands, selectedFeatures]);

  const handleSelectComponent = (component) => {
    selectComponent(categoryKey, component);
    router.push("/pc-builder"); // Redirect back to PC Builder
  };
  
  const handlePriceChange = (e, index) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => {
      const newRange = [...prev];
      newRange[index] = value;
      return newRange;
    });
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        return prev.filter(b => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
  };

  const toggleFeature = (feature) => {
    setSelectedFeatures(prev => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  const clearFilters = () => {
    if (componentProducts && componentProducts.length > 0) {
      const prices = componentProducts.map(p => p.price);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      setPriceRange([minPrice, maxPrice]);
    }
    setSelectedBrands([]);
    setSelectedFeatures([]);
    setSearchQuery("");
    setSortBy("recommended");
  };

  // If component category doesn't exist
  if (!componentCategory) {
    return (
      <div className="container mx-auto px-4 py-10 mt-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Component Category Not Found</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            The component category you're looking for doesn't exist.
          </p>
          <Link 
            href="/pc-builder" 
            className="mt-6 inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to PC Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Link href="/pc-builder" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to PC Builder
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Select {componentCategory.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Choose from {filteredAndSortedProducts.length} available options
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full md:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="recommended">Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
          
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filters
            {(selectedBrands.length > 0 || selectedFeatures.length > 0) && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                {selectedBrands.length + selectedFeatures.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters - visible on desktop, toggleable on mobile */}
        <div className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Filters</h3>
              <button 
                onClick={clearFilters}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear all
              </button>
            </div>
            
            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3">Price Range</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">${priceRange[0]}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">${priceRange[1]}</span>
              </div>
              <div className="relative mb-4">
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full absolute inset-x-0 top-1/2 -translate-y-1/2"></div>
                <input
                  type="range"
                  min={componentProducts.length > 0 ? Math.floor(Math.min(...componentProducts.map(p => p.price))) : 0}
                  max={componentProducts.length > 0 ? Math.ceil(Math.max(...componentProducts.map(p => p.price))) : 1000}
                  value={priceRange[0]}
                  onChange={(e) => handlePriceChange(e, 0)}
                  className="absolute inset-0 w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer"
                />
                <input
                  type="range"
                  min={componentProducts.length > 0 ? Math.floor(Math.min(...componentProducts.map(p => p.price))) : 0}
                  max={componentProducts.length > 0 ? Math.ceil(Math.max(...componentProducts.map(p => p.price))) : 1000}
                  value={priceRange[1]}
                  onChange={(e) => handlePriceChange(e, 1)}
                  className="absolute inset-0 w-full h-2 appearance-none bg-transparent pointer-events-auto cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label htmlFor="min-price" className="text-xs text-gray-500 dark:text-gray-400">Min Price</label>
                  <input
                    id="min-price"
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceChange(e, 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="max-price" className="text-xs text-gray-500 dark:text-gray-400">Max Price</label>
                  <input
                    id="max-price"
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e, 1)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            {/* Brand Filter */}
            {availableBrands.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3">Brand</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableBrands.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Features Filter */}
            {availableFeatures.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3">Features</h4>
                <div className="space-y-2">
                  {availableFeatures.map((feature) => (
                    <label key={feature} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Active Filters */}
            {(selectedBrands.length > 0 || selectedFeatures.length > 0) && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-2">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBrands.map(brand => (
                    <div key={`filter-${brand}`} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-xs flex items-center">
                      {brand}
                      <button 
                        onClick={() => toggleBrand(brand)}
                        className="ml-1 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {selectedFeatures.map(feature => (
                    <div key={`filter-${feature}`} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-xs flex items-center">
                      {feature}
                      <button 
                        onClick={() => toggleFeature(feature)}
                        className="ml-1 focus:outline-none"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-grow">
          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="h-48 w-full relative mb-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">{product.name}</h3>
                    
                    {product.specs && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {product.specs}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      <p className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
                        ${product.price.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleSelectComponent(product)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No components found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || selectedBrands.length > 0 || selectedFeatures.length > 0
                  ? "No results match your current filters. Try different criteria."
                  : "No components available in this category at the moment."
                }
              </p>
              {(searchQuery || selectedBrands.length > 0 || selectedFeatures.length > 0) && (
                <button
                  onClick={clearFilters}
                  className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}