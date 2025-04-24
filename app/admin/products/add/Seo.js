import React, { useState } from "react";

const Seo = ({ formData, handleChange, errors }) => {
  const [enabled, setEnabled] = useState(!!formData.metaTitle || !!formData.metaDescription || !!formData.metaKeywords);

  const handleToggle = () => {
    setEnabled(!enabled);
    
    // Reset SEO values if toggling off
    if (enabled) {
      handleChange({ target: { name: "metaTitle", value: "" } });
      handleChange({ target: { name: "metaDescription", value: "" } });
      handleChange({ target: { name: "metaKeywords", value: "" } });
      handleChange({ target: { name: "canonicalURL", value: "" } });
    }
  };

  return (
    <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          SEO Settings
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle || ""}
              onChange={handleChange}
              placeholder="Enter meta title (recommended: 50-60 characters)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {formData.metaTitle && (
              <div className="mt-1 text-xs text-gray-500">
                {formData.metaTitle.length}/60 characters
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Enter meta description (recommended: 150-160 characters)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            ></textarea>
            {formData.metaDescription && (
              <div className="mt-1 text-xs text-gray-500">
                {formData.metaDescription.length}/160 characters
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Keywords
            </label>
            <input
              type="text"
              name="metaKeywords"
              value={formData.metaKeywords || ""}
              onChange={handleChange}
              placeholder="Enter keywords separated by commas"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-1 text-xs text-gray-500">
              Example: electronics, laptop, high-performance
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Canonical URL
            </label>
            <input
              type="text"
              name="canonicalURL"
              value={formData.canonicalURL || ""}
              onChange={handleChange}
              placeholder="https://yourdomain.com/product-page"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <div className="mt-1 text-xs text-gray-500">
              Use this to prevent duplicate content issues
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seo;