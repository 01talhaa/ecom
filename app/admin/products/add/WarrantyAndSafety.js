import React, { useState } from "react";

const WarrantyAndSafety = ({ formData, handleChange, errors }) => {
  const [enabled, setEnabled] = useState(!!formData.warranty || !!formData.safetyWarnings);

  const handleToggle = () => {
    setEnabled(!enabled);
    
    // Reset values if toggling off
    if (enabled) {
      handleChange({ target: { name: "warranty", value: "" } });
      handleChange({ target: { name: "safetyWarnings", value: "" } });
    }
  };

  return (
    <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Warranty & Safety Information
        </h2>
        <div className="flex items-center">
          <span className="mr-3 text-sm text-gray-500 dark:text-gray-400">
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {enabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Warranty Information
            </label>
            <textarea
              name="warranty"
              value={formData.warranty || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Enter warranty details for this product"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Safety Warnings
            </label>
            <textarea
              name="safetyWarnings"
              value={formData.safetyWarnings || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Enter any safety warnings or precautions"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyAndSafety;