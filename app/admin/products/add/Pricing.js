// components/products/Pricing.js

import React from "react";

const Pricing = ({ formData, handleChange, errors }) => {
  return (
    <div className="md:col-span-2">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Pricing
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Original Price*
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full pl-7 px-3 py-2 border ${
                errors.originalPrice
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.originalPrice && (
            <p className="mt-1 text-sm text-red-500">{errors.originalPrice}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Discounted Price*
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="number"
              name="discountedPrice"
              value={formData.discountedPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full pl-7 px-3 py-2 border ${
                errors.discountedPrice
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
            />
          </div>
          {errors.discountedPrice && (
            <p className="mt-1 text-sm text-red-500">
              {errors.discountedPrice}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Discount Rate (%)
          </label>
          <input
            type="number"
            name="discountRate"
            value={formData.discountRate}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default Pricing;