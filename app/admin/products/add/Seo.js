import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react"; // For error display

const Seo = ({
    formData,
    handleChange,
    errors = {} // Default to empty object
}) => {
    // Determine initial state based on if *any* SEO field has content
    const [enabled, setEnabled] = useState(
        !!formData.metaTitle ||
        !!formData.metaDescription ||
        !!formData.metaKeywords ||
        !!formData.canonicalURL
    );

    // Sync local state if formData props change externally
    useEffect(() => {
        setEnabled(
            !!formData.metaTitle ||
            !!formData.metaDescription ||
            !!formData.metaKeywords ||
            !!formData.canonicalURL
        );
    }, [formData.metaTitle, formData.metaDescription, formData.metaKeywords, formData.canonicalURL]);

    const handleToggle = () => {
        const newState = !enabled;
        setEnabled(newState);

        // If disabling, clear all SEO fields
        if (!newState) {
            handleChange({ target: { name: "metaTitle", value: "" } });
            handleChange({ target: { name: "metaDescription", value: "" } });
            handleChange({ target: { name: "metaKeywords", value: "" } });
            handleChange({ target: { name: "canonicalURL", value: "" } });
        }
        // No separate formData field for 'enabled' state needed
    };

    // Helper function for character limits and styling
    const getCounterClass = (currentLength, limit) => {
        if (currentLength > limit) return 'text-red-600 dark:text-red-400';
        if (currentLength > limit * 0.9) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-gray-500 dark:text-gray-400';
    };

    // Get potential errors (adjust keys if needed)
    const metaTitleError = errors.metaTitle;
    const metaDescriptionError = errors.metaDescription;
    const metaKeywordsError = errors.metaKeywords;
    const canonicalURLError = errors.canonicalURL;

    const metaTitleLength = formData.metaTitle?.length || 0;
    const metaDescriptionLength = formData.metaDescription?.length || 0;
    const META_TITLE_LIMIT = 60;
    const META_DESC_LIMIT = 160;


    return (
        // Consistent container styling
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            {/* Standard Main Header with Toggle */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">
                    <span className="border-l-4 border-blue-500 pl-3">SEO Settings</span>
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
                        <span className="sr-only">Enable SEO Settings</span>
                         <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                    </button>
                </div>
            </div>

            {/* Conditional Content Area */}
            {enabled && (
                <div className="space-y-6 pt-4"> {/* Added pt-4 and space-y-6 */}
                    {/* Meta Title */}
                    <div>
                        <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Meta Title <span className="text-xs text-gray-400">(Recommended: ~{META_TITLE_LIMIT} chars)</span>
                        </label>
                        <input
                            type="text"
                            id="metaTitle"
                            name="metaTitle"
                            value={formData.metaTitle || ""}
                            onChange={handleChange}
                            maxLength={META_TITLE_LIMIT + 10} // Allow slight over typing
                            placeholder="Page title shown in search results"
                            // Consistent input styling
                            className={`w-full px-3 py-2 border rounded-md shadow-sm
                                ${metaTitleError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                                focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white`}
                            aria-invalid={!!metaTitleError}
                            aria-describedby={metaTitleError ? `meta-title-error` : `meta-title-counter`}
                        />
                         <div className="flex justify-between items-center mt-1">
                            {metaTitleError ? (
                                <p className="text-xs text-red-500 flex items-center" id="meta-title-error">
                                    <AlertCircle className="w-3 h-3 mr-1 inline" />
                                    {metaTitleError}
                                </p>
                            ) : <span></span> } {/* Empty span to maintain alignment */}
                            <p className={`text-xs ${getCounterClass(metaTitleLength, META_TITLE_LIMIT)}`} id="meta-title-counter">
                                {metaTitleLength}/{META_TITLE_LIMIT}
                            </p>
                         </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Meta Description <span className="text-xs text-gray-400">(Recommended: ~{META_DESC_LIMIT} chars)</span>
                        </label>
                        <textarea
                            id="metaDescription"
                            name="metaDescription"
                            value={formData.metaDescription || ""}
                            onChange={handleChange}
                            rows={4} // Increased rows
                            maxLength={META_DESC_LIMIT + 20} // Allow slight over typing
                            placeholder="Brief summary of the page shown in search results"
                             // Consistent textarea styling
                            className={`w-full px-3 py-2 border rounded-md shadow-sm
                                ${metaDescriptionError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                                focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white`}
                            aria-invalid={!!metaDescriptionError}
                            aria-describedby={metaDescriptionError ? `meta-desc-error` : `meta-desc-counter`}
                        ></textarea>
                         <div className="flex justify-between items-center mt-1">
                             {metaDescriptionError ? (
                                <p className="text-xs text-red-500 flex items-center" id="meta-desc-error">
                                    <AlertCircle className="w-3 h-3 mr-1 inline" />
                                    {metaDescriptionError}
                                </p>
                             ) : <span></span> } {/* Empty span for alignment */}
                             <p className={`text-xs ${getCounterClass(metaDescriptionLength, META_DESC_LIMIT)}`} id="meta-desc-counter">
                                {metaDescriptionLength}/{META_DESC_LIMIT}
                            </p>
                         </div>
                    </div>

                    {/* Meta Keywords */}
                    <div>
                        <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Meta Keywords <span className="text-xs text-gray-400">(Comma-separated, Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="metaKeywords"
                            name="metaKeywords"
                            value={formData.metaKeywords || ""}
                            onChange={handleChange}
                            placeholder="e.g., keyword1, keyword2, keyword phrase"
                            // Consistent input styling
                            className={`w-full px-3 py-2 border rounded-md shadow-sm
                                ${metaKeywordsError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                                focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white`}
                            aria-invalid={!!metaKeywordsError}
                            aria-describedby={metaKeywordsError ? `meta-keywords-error` : `meta-keywords-desc`}
                        />
                         {metaKeywordsError ? (
                            <p className="mt-1 text-xs text-red-500 flex items-center" id="meta-keywords-error">
                                <AlertCircle className="w-3 h-3 mr-1 inline" />
                                {metaKeywordsError}
                            </p>
                        ) : (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400" id="meta-keywords-desc">
                                Less important for modern SEO, but can be used for internal search.
                            </p>
                        )}
                    </div>

                     {/* Canonical URL */}
                     <div>
                        <label htmlFor="canonicalURL" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Canonical URL <span className="text-xs text-gray-400">(Advanced, Optional)</span>
                        </label>
                        <input
                            type="url" // Use type="url" for basic validation
                            id="canonicalURL"
                            name="canonicalURL"
                            value={formData.canonicalURL || ""}
                            onChange={handleChange}
                            placeholder="https://yourdomain.com/preferred-product-url"
                            // Consistent input styling
                            className={`w-full px-3 py-2 border rounded-md shadow-sm
                                ${canonicalURLError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                                focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white`}
                           aria-invalid={!!canonicalURLError}
                           aria-describedby={canonicalURLError ? `canonical-url-error` : `canonical-url-desc`}
                        />
                        {canonicalURLError ? (
                            <p className="mt-1 text-xs text-red-500 flex items-center" id="canonical-url-error">
                                <AlertCircle className="w-3 h-3 mr-1 inline" />
                                {canonicalURLError}
                            </p>
                        ) : (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400" id="canonical-url-desc">
                                Specify the main URL if this content exists on multiple pages (prevents duplicate content issues).
                            </p>
                        )}
                    </div>
                </div>
            )}

             {/* Placeholder Text when Disabled */}
            {!enabled && (
                <p className="text-sm text-gray-500 dark:text-gray-400 pt-4">
                    Enable SEO settings to customize how this product appears in search engine results.
                </p>
            )}
        </div>
    );
};

export default Seo;