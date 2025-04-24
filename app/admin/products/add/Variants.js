import React from "react";
import { X, Plus, Barcode } from "lucide-react";

const Variants = ({
  formData,
  handleChange,
  addVariant,
  removeVariant,
  errors,
  enabled,
  onToggleEnabled,
}) => {
  return (
    <div className="md:col-span-2 border dark:border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          Product Variants
        </h2>

        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <button
            type="button"
            onClick={onToggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              enabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {enabled && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Variant
            </button>
          </div>

          {formData.variants.map((variant, index) => (
            <div
              key={index}
              className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Variant #{index + 1}
                </h3>
                {formData.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variant Name
                  </label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    placeholder="e.g. Small, Red, 256GB"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Add the variant barcode field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Barcode <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      <Barcode className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={variant.barcode || ''}
                      onChange={(e) => {
                        // Only allow numbers in barcode field
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        handleChange(index, "barcode", value);
                      }}
                      placeholder="Numeric barcode"
                      className="w-full pl-9 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generate</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleChange(index, "price", e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-7 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleChange(index, "stock", e.target.value)}
                    min="0"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}

          {formData.variants.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No variants added yet.
              </p>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Variant
              </button>
            </div>
          )}
        </div>
      )}

      {/* {!enabled && (
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          Toggle the switch to add product variants
        </div>
      )} */}
    </div>
  );
};

export default Variants;