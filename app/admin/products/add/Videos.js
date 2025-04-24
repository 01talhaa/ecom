import React from 'react';
import { X, Upload, Video as VideoIcon, Loader } from 'lucide-react';

const Videos = ({ 
  formData, 
  handleChange, 
  previewVideos, 
  removeVideo, 
  errors, 
  uploadStatus = { loading: false, progress: 0, error: null } // Add default value
}) => {
  return (
    <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Product Videos</h2>
      
      <div className="mb-4">
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
          <div className="space-y-1 text-center">
            <VideoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor="video-upload"
                className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload videos</span>
                <input
                  id="video-upload"
                  name="videos"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleChange}
                  className="sr-only"
                  disabled={uploadStatus?.loading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              MP4, WebM, AVI up to 100MB
            </p>
          </div>
        </div>
        
        {uploadStatus?.loading && (
          <div className="mt-2 flex items-center justify-center">
            <Loader className="animate-spin h-5 w-5 mr-2 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Uploading videos...</span>
          </div>
        )}
        
        {uploadStatus?.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {uploadStatus.error}
          </p>
        )}
        
        {errors?.videos && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.videos}
          </p>
        )}
      </div>
      
      {previewVideos.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Uploaded Videos ({previewVideos.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewVideos.map((videoUrl, index) => (
              <div
                key={index}
                className="relative border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden"
              >
                <video 
                  className="w-full h-auto" 
                  controls 
                  src={videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                  aria-label="Remove video"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;