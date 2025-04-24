// components/products/Inventory.js

import React from "react";

const Inventory = ({ formData, handleChange, errors }) => {
  return (
    <div className="md:col-span-2">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Inventory
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stock Quantity*
          </label>
          <input
            type="number"
            name="stockQuantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            min="0"
            className={`w-full px-3 py-2 border ${
              errors.stockQuantity
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.stockQuantity && (
            <p className="mt-1 text-sm text-red-500">{errors.stockQuantity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex items-center mt-8">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="featured"
            className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Featured Product
          </label>
        </div>
      </div>
    </div>
  );
};

export default Inventory;