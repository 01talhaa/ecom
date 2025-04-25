import React, { useState, useEffect } from "react";
import { AlertCircle, ChevronDown } from "lucide-react"; // Added icons

const VatAndShipping = ({
    formData,
    handleChange,
    errors = {} // Default to empty object
}) => {
    const [vatEnabled, setVatEnabled] = useState(false);
    const [shippingEnabled, setShippingEnabled] = useState(false);

    // Then sync with formData on component mount and updates
    useEffect(() => {
        setVatEnabled(!!formData.vatEnable);
    }, [formData.vatEnable]);
    useEffect(() => {
        setShippingEnabled(!!formData.shippingEnabled);
        
    }, [formData.shippingEnabled]); 

    const handleVatToggle = () => {
        const newState = !vatEnabled;
        setVatEnabled(newState);

        // Update the formData for vatEnable (using boolean value)
        handleChange({
            target: {
                name: "vatEnable",
                value: newState, // Pass boolean directly
                type: "checkbox", // Keep type for context if needed
            }
        });

        // Reset VAT values if turning off
        if (!newState) {
            handleChange({ target: { name: "vatAmount", value: "0" } });
        } else {
             // If enabling and amount is 0 or invalid, maybe set a default? Optional.
             if (!formData.vatAmount || parseFloat(formData.vatAmount) <= 0) {
                 // handleChange({ target: { name: "vatAmount", value: "" } }); // Clear or set default
             }
        }
    };

    // Then update the handleShippingToggle function to preserve any input
    const handleShippingToggle = () => {
        const newState = !shippingEnabled;
        setShippingEnabled(newState);

        // Set a dedicated shipping enabled flag
        handleChange({
            target: {
                name: "shippingEnabled",
                value: newState,
                type: "checkbox",
            }
        });

        // Reset shipping cost to '0' ONLY when turning off
        if (!newState) {
            handleChange({ target: { name: "shippingCost", value: "0" } });
        }
        // Don't modify the input value when turning on - let the user type whatever they want
    };

    const vatAmountError = errors.vatAmount;
    const shippingCostError = errors.shippingCost;

    return (
        // Consistent container styling
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            {/* Main Section Header (No toggle needed here, just title) */}
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="border-l-4 border-blue-500 pl-3">VAT & Shipping</span>
            </h2>

            <div className="space-y-8"> {/* Increased space between sections */}

                {/* VAT Section */}
                <div className="space-y-4">
                    {/* VAT Sub-header with Toggle */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-gray-200/60 dark:border-gray-700/60">
                        <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-100 mb-2 sm:mb-0">
                            VAT Settings
                        </h3>
                        <div className="flex items-center self-start sm:self-center">
                            <span className={`mr-3 text-sm font-medium ${vatEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {vatEnabled ? "Enabled" : "Disabled"}
                            </span>
                            <button
                                type="button"
                                onClick={handleVatToggle}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${vatEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                aria-pressed={vatEnabled}
                            >
                                <span className="sr-only">Enable VAT</span>
                                <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${vatEnabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                            </button>
                        </div>
                    </div>

                    {/* VAT Content (Conditional) */}
                    {vatEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 pt-2"> {/* Added gap + pt */}
                            {/* VAT Type Select */}
                            <div>
                                <label htmlFor="vatType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    VAT Type*
                                </label>
                                <div className="relative">
                                    <select
                                        id="vatType"
                                        name="vatType"
                                        value={formData.vatType || 'Percentage'} // Default to Percentage if undefined
                                        onChange={handleChange}
                                        // Consistent select styling
                                        className={`w-full pl-3 pr-10 py-2 text-base border rounded-md shadow-sm appearance-none
                                            border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500
                                            focus:outline-none focus:ring-1
                                            transition-colors dark:bg-gray-700 dark:text-white`}
                                    >
                                        <option value="Percentage">Percentage (%)</option>
                                        <option value="Fixed">Fixed Amount ($)</option> {/* Clarify symbol */}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                                       <ChevronDown className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                </div>
                            </div>

                            {/* VAT Amount Input */}
                            <div>
                                <label htmlFor="vatAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    VAT Amount*
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    {/* Prefix for Fixed type */}
                                    {formData.vatType === 'Fixed' && (
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                                        </div>
                                    )}
                                    <input
                                        type="number"
                                        id="vatAmount"
                                        name="vatAmount"
                                        value={formData.vatAmount === null || formData.vatAmount === undefined ? '' : formData.vatAmount}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        // Consistent input styling with conditional padding
                                        className={`w-full pr-10 py-2 border rounded-md
                                            ${formData.vatType === 'Fixed' ? 'pl-7' : 'pl-3'}
                                            ${vatAmountError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                                            focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white
                                            // Hide spin buttons
                                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        aria-invalid={!!vatAmountError}
                                        aria-describedby={vatAmountError ? `vat-amount-error` : undefined}
                                    />
                                    {/* Suffix for Percentage type */}
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                         <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                                            {formData.vatType === 'Percentage' ? '%' : ''}
                                         </span>
                                    </div>
                                </div>
                                {vatAmountError && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center" id="vat-amount-error">
                                        <AlertCircle className="w-3 h-3 mr-1 inline" />
                                        {vatAmountError}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    {!vatEnabled && (
                         <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">Enable VAT to configure tax settings for this product.</p>
                    )}
                </div>

                {/* Shipping Section */}
                <div className="space-y-4">
                     {/* Shipping Sub-header with Toggle */}
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-2 border-b border-gray-200/60 dark:border-gray-700/60">
                        <h3 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-100 mb-2 sm:mb-0">
                            Shipping Settings
                        </h3>
                        <div className="flex items-center self-start sm:self-center">
                             <span className={`mr-3 text-sm font-medium ${shippingEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {shippingEnabled ? "Enabled" : "Disabled"}
                            </span>
                            <button
                                type="button"
                                onClick={handleShippingToggle}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${shippingEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                aria-pressed={shippingEnabled}
                            >
                                <span className="sr-only">Enable Shipping Cost</span>
                                <span aria-hidden="true" className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${shippingEnabled ? 'translate-x-5' : 'translate-x-0'}`}/>
                            </button>
                        </div>
                    </div>

                    {/* Shipping Content (Conditional) */}
                    {shippingEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 pt-2"> {/* Use grid for alignment, even with one item */}
                           <div>
                                <label htmlFor="shippingCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Shipping Cost* <span className="text-xs text-gray-400">(Set to 0 for free shipping)</span>
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        id="shippingCost"
                                        name="shippingCost"
                                        value={formData.shippingCost === null || formData.shippingCost === undefined ? '' : formData.shippingCost}
                                        onChange={handleChange}
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        // Consistent input styling
                                        className={`w-full pl-7 pr-3 py-2 border rounded-md
                                            ${shippingCostError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
                                            focus:outline-none focus:ring-1 transition-colors dark:bg-gray-700 dark:text-white
                                            // Hide spin buttons
                                            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                        aria-invalid={!!shippingCostError}
                                        aria-describedby={shippingCostError ? `shipping-cost-error` : undefined}
                                    />
                                </div>
                                {shippingCostError && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center" id="shipping-cost-error">
                                         <AlertCircle className="w-3 h-3 mr-1 inline" />
                                        {shippingCostError}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                     {!shippingEnabled && (
                         <p className="text-sm text-gray-500 dark:text-gray-400 pt-2">Enable Shipping to set a specific shipping cost for this product.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VatAndShipping;