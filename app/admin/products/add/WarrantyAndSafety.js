import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react"; // For potential future error display

const WarrantyAndSafety = ({
    formData,
    handleChange,
    errors = {} // Default to empty object
}) => {
    // Initialize state based on whether either field has content
    const [enabled, setEnabled] = useState(!!formData.warranty || !!formData.safetyWarnings);

    // Sync local state if formData props change externally
    useEffect(() => {
        setEnabled(!!formData.warranty || !!formData.safetyWarnings);
    }, [formData.warranty, formData.safetyWarnings]);

    const handleToggle = () => {
        const newState = !enabled;
        setEnabled(newState);

        // If disabling, clear the related formData fields
        if (!newState) {
            handleChange({ target: { name: "warranty", value: "" } });
            handleChange({ target: { name: "safetyWarnings", value: "" } });
        }
        // No explicit formData field needed for the enabled state itself
    };

    // Helper to get potential errors (adjust keys if needed)
    const warrantyError = errors.warranty;
    const safetyWarningsError = errors.safetyWarnings;

    return (
        // Consistent container styling
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            {/* Standard Main Header with Toggle */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">
                    <span className="border-l-4 border-blue-500 pl-3">Warranty & Safety</span>
                </h2>
                <div className="flex items-center self-start sm:self-center">
                    <span className={`mr-3 text-sm font-medium ${enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {enabled ? "Enabled" : "Disabled"}
                    </span>
                    <button
                        type="button"
                        onClick={handleToggle}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                        aria-pressed={enabled}
                    >
                        <span className="sr-only">Enable Warranty and Safety Information</span>
                        <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                    </button>
                </div>
            </div>

            {/* Conditional Content Area */}
            {enabled && (
                // Using grid layout for the two textareas
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 pt-4"> {/* Added pt-4 for spacing */}
                    {/* Warranty Information */}
                    <div>
                        <label htmlFor="warranty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Warranty Information <span className="text-xs text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="warranty"
                            name="warranty"
                            value={formData.warranty || ""} // Ensure controlled component
                            onChange={handleChange}
                            rows={5} // Slightly increased rows for better editing
                            placeholder="e.g., 1-year limited warranty, conditions apply..."
                            // Consistent textarea styling
                            className={`w-full px-3 py-2 border rounded-md shadow-sm
                                ${warrantyError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                                focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white`}
                            aria-invalid={!!warrantyError}
                            aria-describedby={warrantyError ? `warranty-error` : undefined}
                        ></textarea>
                         {warrantyError && (
                            <p className="mt-1 text-xs text-red-500 flex items-center" id="warranty-error">
                                <AlertCircle className="w-3 h-3 mr-1 inline" />
                                {warrantyError}
                            </p>
                        )}
                    </div>

                    {/* Safety Warnings */}
                    <div>
                        <label htmlFor="safetyWarnings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Safety Warnings <span className="text-xs text-gray-400">(Optional)</span>
                        </label>
                        <textarea
                            id="safetyWarnings"
                            name="safetyWarnings"
                            value={formData.safetyWarnings || ""} // Ensure controlled component
                            onChange={handleChange}
                            rows={5} // Slightly increased rows
                            placeholder="e.g., Choking hazard, keep away from children..."
                            // Consistent textarea styling
                             className={`w-full px-3 py-2 border rounded-md shadow-sm
                                ${safetyWarningsError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                                focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white`}
                           aria-invalid={!!safetyWarningsError}
                           aria-describedby={safetyWarningsError ? `safety-warnings-error` : undefined}
                        ></textarea>
                         {safetyWarningsError && (
                            <p className="mt-1 text-xs text-red-500 flex items-center" id="safety-warnings-error">
                                <AlertCircle className="w-3 h-3 mr-1 inline" />
                                {safetyWarningsError}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Placeholder Text when Disabled */}
            {!enabled && (
                <p className="text-sm text-gray-500 dark:text-gray-400 pt-4">
                    Enable this section to add warranty details or safety warnings if applicable.
                </p>
            )}
        </div>
    );
};

export default WarrantyAndSafety;