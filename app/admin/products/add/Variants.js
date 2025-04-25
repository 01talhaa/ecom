// Fixed Variants.js with title as input field instead of API-loaded dropdown

import React from "react";
import { X, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";

const Variants = ({
  formData,
  handleChange,
  addVariant,
  removeVariant,
  errors = {},
  enabled,
  onToggleEnabled,
}) => {
  // Helper to check for errors on a specific field
  const getFieldError = (index, field) => {
    return errors[`variants.${index}.${field}`];
  };

  return (
    <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">
          <span className="border-l-4 border-blue-500 pl-3">Product Variants</span>
        </h2>
        <div className="flex items-center self-start sm:self-center">
          <span className={`mr-3 text-sm font-medium ${enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <button
            type="button"
            onClick={onToggleEnabled}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
            aria-pressed={enabled}
          >
            <span className="sr-only">Enable product variants</span>
            <span
              aria-hidden="true"
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Conditional Content Area */}
      {enabled && (
        <div className="space-y-6">
          {/* Info text and Add button */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add different versions of your product, like sizes or colors.
            </p>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center justify-center sm:justify-start px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors whitespace-nowrap"
            >
              <Plus className="-ml-1 mr-1.5 h-4 w-4" aria-hidden="true" />
              Add Variant
            </button>
          </div>

          {/* List of Variants */}
          {formData?.variants?.length > 0 ? (
            <div className="space-y-4">
              {formData.variants.map((variant, index) => {
                const titleIdError = getFieldError(index, "titleId");
                const variantNameError = getFieldError(index, "variantName");

                return (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 shadow-sm"
                  >
                    {/* Variant Item Header */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">
                        {variant.variantName || `Variant #${index + 1}`}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-1 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors"
                        aria-label={`Remove Variant ${index + 1}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Variant Fields - Matching API Structure with input fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4">
                      {/* Title ID as numeric input */}
                      <div>
                        <label htmlFor={`variant-titleId-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Title ID*
                        </label>
                        <input
                          type="number"
                          id={`variant-titleId-${index}`}
                          value={variant.titleId || ''}
                          onChange={(e) => handleChange(index, "titleId", parseInt(e.target.value, 10) || 0)}
                          placeholder="e.g., 1"
                          min="0"
                          className={`w-full px-3 py-2 border rounded-md shadow-sm
                            ${titleIdError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}
                            focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white
                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        />
                        {titleIdError && (
                          <p className="mt-1 text-xs text-red-500" id={`variant-titleId-error-${index}`}>
                            <AlertCircle className="w-3 h-3 mr-1 inline" />
                            {titleIdError}
                          </p>
                        )}
                      </div>

                      {/* Variant Name */}
                      <div>
                        <label htmlFor={`variant-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Variant Name*
                        </label>
                        <input
                          type="text"
                          id={`variant-name-${index}`}
                          value={variant.variantName || ''}
                          onChange={(e) => handleChange(index, "variantName", e.target.value)}
                          placeholder="e.g., Small, Red"
                          className={`w-full px-3 py-2 border rounded-md shadow-sm
                            ${variantNameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}
                            focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white`}
                        />
                        {variantNameError && (
                          <p className="mt-1 text-xs text-red-500" id={`variant-name-error-${index}`}>
                            <AlertCircle className="w-3 h-3 mr-1 inline" />
                            {variantNameError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Empty state when enabled but no variants added
            <div className="text-center py-6 px-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              {/* <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No variants added</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding the first product variant.</p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  <Plus className="-ml-1 mr-1.5 h-4 w-4" aria-hidden="true" />
                  Add First Variant
                </button>
              </div> */}
            </div>
          )}

          {/* Display overall variants error */}
          {errors.variants && typeof errors.variants === 'string' && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.variants}</div>
          )}
        </div>
      )}
       {!enabled && (
                <p className="text-sm text-gray-500 dark:text-gray-400 pt-4">
                    Enable this section to add variant details if applicable.
                </p>
            )}
    </div>
  );
};

export default Variants;