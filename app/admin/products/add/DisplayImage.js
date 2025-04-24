"use client"

import React, { useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader } from "lucide-react";
import { getApiUrl, API_ENDPOINTS } from "@/utils/apiConfig";

const DisplayImage = ({ 
  displayImage, 
  handleDisplayImageUpload: propHandleDisplayImageUpload, 
  removeDisplayImage, 
  errors,
  uploadStatus 
}) => {
  const inputFileRef = useRef(null);

  // Create a wrapper for the image upload handler
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Get the properly constructed API URL
    const apiUrl = getApiUrl(API_ENDPOINTS.UPLOAD_PRODUCT_IMAGE);
    console.log("Using API URL for upload:", apiUrl);
    
    // Call the parent component's handler with the file and URL
    propHandleDisplayImageUpload(event, apiUrl);
  };

  return (
    <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Product Display Image
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        This image will be used as the main profile image for your product in listings and search results.
      </p>

      <div>
        {!displayImage ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-64 p-6">
            <div className="text-center mb-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                No display image
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload a main product image (recommended size: 1000x1000 pixels)
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => inputFileRef.current.click()}
              disabled={uploadStatus?.loading}
              className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploadStatus?.loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </>
              )}
            </button>
            
            <input
              ref={inputFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploadStatus?.loading}
            />
          </div>
        ) : (
          <div className="relative">
            <div className="relative aspect-square max-w-md mx-auto overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <Image
                src={displayImage}
                alt="Product display image"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <button
              type="button"
              onClick={removeDisplayImage}
              disabled={uploadStatus?.loading}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
            {uploadStatus?.loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      {uploadStatus?.error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          Error: {uploadStatus.error}
        </p>
      )}

      {errors && errors.displayImage && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {errors.displayImage}
        </p>
      )}
    </div>
  );
};

export default DisplayImage;