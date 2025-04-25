// components/products/Specifications.js

import React, { useState, useEffect } from "react";
import { X, Plus, Loader2, ChevronDown } from "lucide-react"; // Added ChevronDown

// Assume getAuthToken is defined elsewhere or imported
// const getAuthToken = () => localStorage.getItem('authToken');

const Specifications = ({
  formData, // Assuming formData contains the specifications array under a key like 'specifications'
  handleChange, // Function like (index, field, value) => void
  addSpecification, // Function () => void
  removeSpecification, // Function (index) => void
  errors = {},
  specifications = [], // Use the passed-in specifications array
  // specificationTitles prop is removed as we fetch internally now
}) => {
  // Determine initial enabled state based on if there are *any* non-empty specs
  const initialEnabled = specifications.some(
    (spec) => spec.titleId || spec.paramName || spec.paramValue
  );
  const [enabled, setEnabled] = useState(initialEnabled);
  const [titles, setTitles] = useState([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [fetchTitlesError, setFetchTitlesError] = useState(null);

  // --- Fetch Specification Titles ---
  useEffect(() => {
    const fetchTitles = async () => {
      setLoadingTitles(true);
      setFetchTitlesError(null);
      try {
        // Replace with your actual token retrieval logic (e.g., from context)
        const token = localStorage.getItem('authToken'); // Example: using localStorage
        if (!token) {
          throw new Error("Authentication token is missing.");
        }

        const response = await fetch(`/api/proxy/api/specificationtitle`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
            // Try parsing error response body
            let errorBody = 'Could not read error body';
            try {
                errorBody = await response.text();
            } catch (e) { /* Ignore */ }
            throw new Error(`API error: ${response.status} ${response.statusText}. Body: ${errorBody}`);
        }

        const data = await response.json();
        console.log("Specification Titles API Response:", data);

        if (data.success) {
          let titlesData = [];
          const resultData = data.data?.result || data.data; // Handle both potential structures

          if (Array.isArray(resultData)) {
            titlesData = resultData.map(item => ({
              // Ensure consistent ID and Name properties
              id: (item.titleId || item.id)?.toString(), // Ensure ID is string
              name: item.titleName || item.name
            })).filter(title => title.id && title.name); // Filter out invalid entries
          }
           // Handle cases where API returns success: true but empty data or "No Data Available" message
          if (titlesData.length === 0 && data.message !== "No Data Available") {
              console.warn("API reported success but returned no valid titles data.");
          }

          console.log("Processed specification titles:", titlesData);
          setTitles(titlesData);
        } else {
          // The API returned success: false or another non-success structure
          if (data.message !== "No Data Available") { // Don't treat "No Data" as an error
             throw new Error(data.message || "Failed to fetch specification titles (API error)");
          } else {
             console.log("No specification titles available from API.");
             setTitles([]); // Ensure titles are empty
          }
        }
      } catch (err) {
        console.error("Fetch specification titles error:", err);
        setFetchTitlesError(err.message || "Failed to load specification titles.");
        setTitles([]); // Clear titles on error
      } finally {
        setLoadingTitles(false);
      }
    };

    fetchTitles();
    // Fetch only once on mount. If token logic is reactive, add token retrieval function to deps.
  }, []);

  // --- Toggle Handler ---
  const handleToggle = () => {
    const newEnabledState = !enabled;
    setEnabled(newEnabledState);

    // If enabling and no specs exist, add one
    if (newEnabledState && specifications.length === 0) {
      addSpecification();
    }
    // Optional: Clear specs when disabling (uncomment if needed)
    // if (!newEnabledState && specifications.length > 0) {
    //   // You might need a function like `removeAllSpecifications` passed via props
    //   // or iterate through existing specs and call removeSpecification
    //    console.log("Clearing specifications (implement if needed)");
    // }
  };

  // --- Render ---
  return (
    // Use consistent padding (e.g., p-6) and full width on medium screens
    <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
         <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">
             <span className="border-l-4 border-blue-500 pl-3">Additional Specifications</span>
         </h2>
        <div className="flex items-center self-start sm:self-center">
          <span className={`mr-3 text-sm font-medium ${enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {enabled ? "Enabled" : "Disabled"}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
            aria-pressed={enabled}
          >
            <span className="sr-only">Enable specifications</span>
            <span
              aria-hidden="true"
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0' // Adjusted translate for border
              }`}
            />
          </button>
        </div>
      </div>

      {/* Conditional Content Area */}
      {enabled && (
        <div className="space-y-6"> {/* Add space between elements when enabled */}
          {/* Info text and Add button */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Provide specific details like dimensions, material, features, etc.
            </p>
            <button
              type="button"
              onClick={addSpecification}
              className="inline-flex items-center justify-center sm:justify-start px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors whitespace-nowrap" // Adjusted styling
            >
              <Plus className="-ml-1 mr-1.5 h-4 w-4" aria-hidden="true" />
              Add Specification
            </button>
          </div>

          {/* List of Specifications */}
          {specifications.length > 0 ? (
            <div className="space-y-4"> {/* Space between individual spec blocks */}
              {specifications.map((spec, index) => (
                <div
                  key={index} // Consider using a more stable key if specs can be reordered significantly
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 shadow-sm" // Subtle background and shadow
                >
                  {/* Specification Item Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">
                      Specification #{index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-1 rounded-full text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition-colors"
                      aria-label={`Remove Specification ${index + 1}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Specification Fields */}
                  <div className="grid grid-cols-1 gap-y-4 gap-x-4">
                    {/* Title Select */}
                    <div>
                      <label htmlFor={`spec-title-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Specification Title*
                      </label>
                      <div className="relative">
                         {loadingTitles ? (
                           <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700">
                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                             Loading titles...
                           </div>
                         ) : fetchTitlesError ? (
                            <div className="text-sm text-red-600 dark:text-red-400 px-3 py-2 border border-red-300 dark:border-red-600 rounded-md bg-red-50 dark:bg-red-900/20">
                                Error: {fetchTitlesError}
                            </div>
                         ) : (
                           <>
                             <select
                               id={`spec-title-${index}`}
                               value={spec.titleId || ""} // Ensure controlled component
                               onChange={(e) => {
                                 const selectedId = e.target.value;
                                 const selectedTitle = titles.find(title => title.id === selectedId); // Match exact string ID

                                 handleChange(index, "titleId", selectedId); // Update ID regardless
                                 handleChange(index, "titleText", selectedTitle?.name || ""); // Update text or clear if no match/selection

                                 // console.log(`Selected title: ${selectedTitle?.name} with ID: ${selectedId}`);
                               }}
                               // Consistent input styling
                               className={`w-full pl-3 pr-10 py-2 text-base border rounded-md shadow-sm appearance-none
                                 ${errors[`specifications.${index}.titleId`] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                                 focus:outline-none focus:ring-1
                                 transition-colors dark:bg-gray-700 dark:text-white
                                 ${!spec.titleId ? 'text-gray-500 dark:text-gray-400' : ''}` // Style placeholder
                             }
                               aria-invalid={!!errors[`specifications.${index}.titleId`]}
                               aria-describedby={errors[`specifications.${index}.titleId`] ? `spec-title-error-${index}` : undefined}
                             >
                               <option value="">Select a title...</option>
                               {titles.map((title) => (
                                 <option key={title.id} value={title.id}>
                                   {title.name}
                                 </option>
                               ))}
                               {/* Show if loading finished, no error, and titles array is empty */}
                               {titles.length === 0 && !loadingTitles && !fetchTitlesError && (
                                 <option disabled value="">No titles available</option>
                               )}
                             </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                               <ChevronDown className="h-5 w-5" aria-hidden="true" />
                             </div>
                           </>
                         )}
                       </div>
                        {/* Display individual field error */}
                        {errors[`specifications.${index}.titleId`] && (
                            <p className="mt-1 text-xs text-red-500" id={`spec-title-error-${index}`}>{errors[`specifications.${index}.titleId`]}</p>
                        )}
                    </div>

                    {/* Parameter Name & Value */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4">
                      <div>
                        <label htmlFor={`spec-paramName-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Parameter Name*
                        </label>
                        <input
                          type="text"
                          id={`spec-paramName-${index}`}
                          value={spec.paramName || ''}
                          onChange={(e) => handleChange(index, "paramName", e.target.value)}
                          placeholder="e.g., Material"
                          // Consistent input styling
                          className={`w-full px-3 py-2 border rounded-md shadow-sm
                            ${errors[`specifications.${index}.paramName`] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                            focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white`}
                          aria-invalid={!!errors[`specifications.${index}.paramName`]}
                          aria-describedby={errors[`specifications.${index}.paramName`] ? `spec-paramName-error-${index}` : undefined}
                        />
                         {errors[`specifications.${index}.paramName`] && (
                            <p className="mt-1 text-xs text-red-500" id={`spec-paramName-error-${index}`}>{errors[`specifications.${index}.paramName`]}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`spec-paramValue-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Parameter Value*
                        </label>
                        <input
                          type="text"
                          id={`spec-paramValue-${index}`}
                          value={spec.paramValue || ''}
                          onChange={(e) => handleChange(index, "paramValue", e.target.value)}
                          placeholder="e.g., Aluminum"
                           // Consistent input styling
                          className={`w-full px-3 py-2 border rounded-md shadow-sm
                            ${errors[`specifications.${index}.paramValue`] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                            focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white`}
                          aria-invalid={!!errors[`specifications.${index}.paramValue`]}
                          aria-describedby={errors[`specifications.${index}.paramValue`] ? `spec-paramValue-error-${index}` : undefined}
                        />
                         {errors[`specifications.${index}.paramValue`] && (
                            <p className="mt-1 text-xs text-red-500" id={`spec-paramValue-error-${index}`}>{errors[`specifications.${index}.paramValue`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Optional: Message when enabled but no specs added yet
            <div className="text-center py-4 px-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                <p className="text-sm text-gray-500 dark:text-gray-400">No specifications added yet. Click "Add Specification" to get started.</p>
            </div>
          )}

          {/* Display overall specifications error (if any) */}
          {errors.specifications && typeof errors.specifications === 'string' && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.specifications}</div>
          )}
        </div>
      )}
      {!enabled && (
                <p className="text-sm text-gray-500 dark:text-gray-400 pt-4">
                    Enable this section to add specification details if applicable.
                </p>
            )}
    </div>
  );
};

export default Specifications;