"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// components/products/ProductTabs.js
export default function ProductTabs({ product }) {
  const [activeTab, setActiveTab] = useState('description');
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-16">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'description'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Description
          </button>
          {product.Specifications && product.Specifications.length > 0 && (
            <button
              onClick={() => setActiveTab('specifications')}
              className={`px-6 py-4 text-sm font-medium ${
                activeTab === 'specifications'
                  ? 'border-b-2 border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Specifications
            </button>
          )}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'reviews'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Reviews ({product.Reviews || 0})
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'description' && (
          <div className="prose dark:prose-invert max-w-none">
            <p>{product.Description}</p>
            
            {product.Warranty && (
              <>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6">Warranty Information</h3>
                <p>{product.Warranty}</p>
              </>
            )}
            
            {product.SafetyWarnings && (
              <>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6">Safety Warnings</h3>
                <p>{product.SafetyWarnings}</p>
              </>
            )}
          </div>
        )}
        
        {activeTab === 'specifications' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Technical Specifications</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {product.Specifications.map((spec, index) => (
                    <tr key={spec.specificationId || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 w-1/3">
                        {spec.paramName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {spec.paramValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div>
            {product.Reviews && product.Reviews > 0 ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Reviews</h3>
                <p>Reviews content would go here</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Reviews Yet</h4>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to review this product!</p>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition">
                  Write a Review
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}