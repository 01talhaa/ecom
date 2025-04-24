// components/products/Dimensions.js

import React from "react";

const Dimensions = ({ formData, handleChange, errors }) => {
  return (
    <div className="md:col-span-2">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Dimensions (cm)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Length
          </label>
          <input
            type="number"
            name="dimensions.length"
            value={formData.dimensions.length}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Width
          </label>
          <input
            type="number"
            name="dimensions.width"
            value={formData.dimensions.width}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Height
          </label>
          <input
            type="number"
            name="dimensions.height"
            value={formData.dimensions.height}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default Dimensions;