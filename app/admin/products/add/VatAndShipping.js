import React, { useState } from "react";

const VatAndShipping = ({ formData, handleChange, errors }) => {
  const [vatEnabled, setVatEnabled] = useState(formData.vatEnable);
  const [shippingEnabled, setShippingEnabled] = useState(!!formData.shippingCost);

  const handleVatToggle = () => {
    const newState = !vatEnabled;
    setVatEnabled(newState);
    
    // Update the formData
    handleChange({
      target: {
        name: "vatEnable",
        type: "checkbox",
        checked: newState
      }
    });
    
    // Reset VAT values if turning off
    if (!newState) {
      handleChange({
        target: {
          name: "vatAmount",
          value: "0"
        }
      });
    }
  };

  const handleShippingToggle = () => {
    const newState = !shippingEnabled;
    setShippingEnabled(newState);
    
    // Reset shipping cost if turning off
    if (!newState) {
      handleChange({
        target: {
          name: "shippingCost",
          value: "0"
        }
      });
    }
  };

  return (
    <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        VAT & Shipping
      </h2>
      
      {/* VAT Section with Toggle */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
            VAT Settings
          </h3>
          <div className="flex items-center">
            <span className="mr-3 text-sm text-gray-500 dark:text-gray-400">
              {vatEnabled ? "Enabled" : "Disabled"}
            </span>
            <button
              type="button"
              onClick={handleVatToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                vatEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  vatEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {vatEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                VAT Type
              </label>
              <select
                name="vatType"
                value={formData.vatType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                VAT Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="vatAmount"
                  value={formData.vatAmount}
                  onChange={handleChange}
                  placeholder="Enter VAT amount"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {formData.vatType === "Percentage" ? "%" : "$"}
                </div>
              </div>
              {errors.vatAmount && (
                <p className="mt-1 text-red-500 text-sm">{errors.vatAmount}</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Shipping Section with Toggle */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
            Shipping Settings
          </h3>
          <div className="flex items-center">
            <span className="mr-3 text-sm text-gray-500 dark:text-gray-400">
              {shippingEnabled ? "Enabled" : "Disabled"}
            </span>
            <button
              type="button"
              onClick={handleShippingToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                shippingEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  shippingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        
        {shippingEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shipping Cost
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                name="shippingCost"
                value={formData.shippingCost}
                onChange={handleChange}
                placeholder="Enter shipping cost"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                $
              </div>
            </div>
            {errors.shippingCost && (
              <p className="mt-1 text-red-500 text-sm">{errors.shippingCost}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VatAndShipping;