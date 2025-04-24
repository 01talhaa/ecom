import { useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Film, File, ChevronLeft, ChevronRight, X, Download, Play, Maximize2 } from 'lucide-react';

// Helper function to check if URL is valid
const isValidUrl = (url) => {
  if (!url) return false;
  if (typeof url !== 'string') return false;
  return url !== '' && !url.startsWith('blob:') && url !== '/placeholder.svg';
};

// Helper function to get media URL
const getMediaUrl = (media) => {
  if (!media) return null;
  const url = media.imageUrl || media.videoUrl || media.fileUrl || media.url;
  return isValidUrl(url) ? url : null;
};

// Helper function to get file name from URL
const getFileName = (url) => {
  if (!url) return 'File';
  const parts = url.split('/');
  return parts[parts.length - 1];
};

export default function MediaGallery({ product }) {
  const [activeTab, setActiveTab] = useState('images');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Organize media by type
  const images = Array.isArray(product?.images) 
    ? product.images.filter(img => isValidUrl(img?.imageUrl || img?.url))
    : [];
    
  const videos = Array.isArray(product?.videos) 
    ? product.videos.filter(vid => isValidUrl(vid?.videoUrl || vid?.url))
    : [];
    
  const files = Array.isArray(product?.files) 
    ? product.files.filter(file => isValidUrl(file?.fileUrl || file?.url))
    : [];

  // Open lightbox
  const openLightbox = (media) => {
    setSelectedMedia(media);
    setLightboxOpen(true);
  };

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedMedia(null);
  };

  return (
    <div className="mt-6 border dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Tabs for different media types */}
      <div className="flex border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('images')}
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === 'images'
              ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Images ({images.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === 'videos'
              ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <Film className="w-4 h-4 mr-2" />
          Videos ({videos.length})
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 font-medium text-sm flex items-center ${
            activeTab === 'files'
              ? 'bg-white dark:bg-gray-800 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          <File className="w-4 h-4 mr-2" />
          Files ({files.length})
        </button>
      </div>

      {/* Images tab content */}
      {activeTab === 'images' && (
        <div className="p-4">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => {
                const imageUrl = getMediaUrl(image);
                if (!imageUrl) return null;
                
                return (
                  <div 
                    key={image.imageId || index} 
                    className="aspect-square relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer group"
                    onClick={() => openLightbox(image)}
                  >
                    <div className="w-full h-full relative">
                      <Image 
                        src={imageUrl}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="w-8 h-8 text-white" />
                    </div>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs py-1 text-center">
                        Thumbnail
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No images available</p>
            </div>
          )}
        </div>
      )}

      {/* Videos tab content */}
      {activeTab === 'videos' && (
        <div className="p-4">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video, index) => {
                const videoUrl = getMediaUrl(video);
                if (!videoUrl) return null;
                
                return (
                  <div 
                    key={video.videoId || index} 
                    className="aspect-video relative rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 border dark:border-gray-600"
                  >
                    <video 
                      src={videoUrl} 
                      controls
                      className="w-full h-full object-contain"
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No videos available</p>
            </div>
          )}
        </div>
      )}

      {/* Files tab content */}
      {activeTab === 'files' && (
        <div className="p-4">
          {files.length > 0 ? (
            <div className="space-y-3">
              {files.map((file, index) => {
                const fileUrl = getMediaUrl(file);
                if (!fileUrl) return null;
                
                return (
                  <div 
                    key={file.fileId || index} 
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <File className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {file.fileName || getFileName(fileUrl)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {file.fileType || 'Document'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <File className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No files available</p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox for images */}
      {lightboxOpen && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            
            {getMediaUrl(selectedMedia) && (
              <Image
                src={getMediaUrl(selectedMedia)}
                alt="Enlarged view"
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] mx-auto object-contain"
                unoptimized
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}