// components/products/Specifications.js

import React, { useState, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";

// Get authentication token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Update the select field implementation to handle undefined values safely
const Specifications = ({
  formData,
  handleChange,
  addSpecification,
  removeSpecification,
  errors = {}, // Add default empty object
  specifications = [], // Add default empty array
  specificationTitles = [] // Add default empty array
}) => {
  const [enabled, setEnabled] = useState(specifications.length > 0 && specifications[0]?.paramName !== "");
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch specification titles from API
  useEffect(() => {
    const fetchTitles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error("Authentication token is missing");
        }
        
        // Fixed API URL - removed v1
        const response = await fetch(`/api/proxy/api/specificationtitle`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Specification Titles API Response:", data);
        
        if (data.success) {
          let titlesData = [];
          
          // Handle different API response structures
          if (data.data && Array.isArray(data.data)) {
            titlesData = data.data.map(item => ({
              id: item.titleId,
              name: item.name || item.titleName
            }));
          } else if (data.data && data.data.result && Array.isArray(data.data.result)) {
            // Alternative response structure
            titlesData = data.data.result.map(item => ({
              id: item.titleId,
              name: item.titleName || item.name
            }));
          }
          
          console.log("Processed specification titles:", titlesData);
          setTitles(titlesData);
        } else {
          // The API returned success: false
          if (data.message !== "No Data Available") {
            throw new Error(data.message || "Failed to fetch specification titles");
          }
        }
      } catch (err) {
        console.error("Fetch specification titles error:", err);
        setError("Failed to load specification titles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTitles();
  }, []);
  
  const handleToggle = () => {
    const newEnabledState = !enabled;
    setEnabled(newEnabledState);
    
    // If turning off specs, we could optionally clear them
    if (!newEnabledState && specifications.length > 0) {
      // This is optional - you may want to clear specs when disabling
      // removeAllSpecifications();
    } else if (newEnabledState && specifications.length === 0) {
      // Add an empty spec row when enabling if none exist
      addSpecification();
    }
  };

  return (
    <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Additional Specifications
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
        <>
          <div className="flex justify-between items-center mb-4 mt-5">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add detailed specifications for your product
            </p>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Specification
            </button>
          </div>

          {specifications.map((spec, index) => (
            <div
              key={index}
              className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specification #{index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Specification Title*
                  </label>
                  {loading ? (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading titles...
                    </div>
                  ) : error ? (
                    <div className="text-sm text-red-500 dark:text-red-400">
                      {error}
                    </div>
                  ) : (
                    // Update the select implementation to be more defensive
                    <select
                      value={spec.titleText || ""}
                      onChange={(e) => {
                        // Find the title object that matches the selected name
                        const selectedTitle = titles.find(title => title?.name === e.target.value);
                        console.log("Selected title:", selectedTitle, "from options:", titles);
                        
                        // Update both the titleText and the titleId
                        handleChange(index, "titleText", e.target.value);
                        if (selectedTitle) {
                          handleChange(index, "titleId", selectedTitle.id);
                          console.log("Setting titleId to:", selectedTitle.id);
                        } else {
                          handleChange(index, "titleId", 0);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select a title</option>
                      {(titles || []).length > 0 ? (
                        titles.map((title) => (
                          <option key={title.id} value={title.name} data-id={title.id}>
                            {title.name}
                          </option>
                        ))
                      ) : (
                        <option disabled value="">No specification titles found</option>
                      )}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parameter Name
                    </label>
                    <input
                      type="text"
                      value={spec.paramName}
                      onChange={(e) => handleChange(index, "paramName", e.target.value)}
                      placeholder="e.g. Material, Color, Battery Life"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parameter Value
                    </label>
                    <input
                      type="text"
                      value={spec.paramValue}
                      onChange={(e) => handleChange(index, "paramValue", e.target.value)}
                      placeholder="e.g. Aluminum, Black, 10 hours"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {errors.specifications && (
            <div className="mt-2 text-red-500 text-sm">{errors.specifications}</div>
          )}
        </>
      )}
    </div>
  );
};

export default Specifications;