import React from 'react';
import { X, Upload, File, FileText, Loader, Download } from 'lucide-react';

const Files = ({ 
  formData, 
  handleChange, 
  previewFiles, 
  removeFile, 
  errors, 
  uploadStatus = { loading: false, progress: 0, error: null } // Add default value
}) => {
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to get appropriate icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <File className="w-8 h-8 text-blue-500" />;
    } else if (fileType.startsWith('text/')) {
      return <FileText className="w-8 h-8 text-green-500" />;
    } else if (fileType.startsWith('application/pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="md:col-span-2 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Product Files & Documents</h2>
      
      <div className="mb-4">
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload files</span>
                <input
                  id="file-upload"
                  name="files"
                  type="file"
                  multiple
                  onChange={handleChange}
                  className="sr-only"
                  disabled={uploadStatus?.loading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PDF, Word, Excel, or any document up to 50MB
            </p>
          </div>
        </div>
        
        {uploadStatus?.loading && (
          <div className="mt-2 flex items-center justify-center">
            <Loader className="animate-spin h-5 w-5 mr-2 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Uploading files...</span>
          </div>
        )}
        
        {uploadStatus?.error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
            <p className="font-semibold">Upload error:</p>
            <p>{uploadStatus.error}</p>
            <p className="text-xs mt-1">Try using a smaller file or different format.</p>
          </div>
        )}
        
        {errors?.files && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.files}
          </p>
        )}
      </div>
      
      {previewFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Uploaded Files ({previewFiles.length})
          </h3>
          <div className="space-y-2">
            {previewFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={file.localUrl}
                    download={file.name}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;