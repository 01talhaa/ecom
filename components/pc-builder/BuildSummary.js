// components/pc-builder/BuildSummary.js
"use client";

import { usePCBuilder } from '@/context/PCBuilderContext';

export default function BuildSummary() {
  const { 
    components, 
    totalPrice, 
    discount, 
    finalPrice,
    exportAsPDF,
    takeScreenshot
  } = usePCBuilder();
  
  const selectedComponentsCount = Object.values(components).filter(Boolean).length;
  const totalComponentsCount = Object.keys(components).length;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Build Summary</h2>
      
      <div className="mb-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${(selectedComponentsCount / totalComponentsCount) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {selectedComponentsCount} of {totalComponentsCount} components selected
        </p>
      </div>
      
      <div className="space-y-3 mb-6">
        {/* List of selected components */}
        {Object.entries(components).map(([key, component]) => (
          component && (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <span className="text-gray-900 dark:text-white font-medium">${component.price.toFixed(2)}</span>
            </div>
          )
        ))}
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between mb-2">
          <span className="text-gray-600 dark:text-gray-400">Discount</span>
          <span className="text-green-600 dark:text-green-400">-${discount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between font-bold">
          <span className="text-gray-900 dark:text-white">Total</span>
          <span className="text-gray-900 dark:text-white">${finalPrice.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={exportAsPDF}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Export as PDF
        </button>
        
        <button
          onClick={takeScreenshot}
          className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Take Screenshot
        </button>
      </div>
    </div>
  );
}