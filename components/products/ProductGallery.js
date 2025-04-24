"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

export default function ProductGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [modalIndex, setModalIndex] = useState(0)
  const [modalZoomLevel, setModalZoomLevel] = useState(1)
  const [modalPanPosition, setModalPanPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mainImageRef = useRef(null)
  const zoomContainerRef = useRef(null)
  const modalImageRef = useRef(null)

  // If no images are provided, use a placeholder
  const imageList = images && images.length > 0 ? images : ["/placeholder.svg"]

  const handleZoom = (e) => {
    if (!mainImageRef.current) return

    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100

    setZoomPosition({ x, y })
  }

  const openGallery = (index) => {
    setModalIndex(index)
    setShowGalleryModal(true)
    document.body.style.overflow = 'hidden'
    // Reset zoom and position when opening gallery
    setModalZoomLevel(1)
    setModalPanPosition({ x: 0, y: 0 })
  }

  const closeGallery = () => {
    setShowGalleryModal(false)
    document.body.style.overflow = 'auto'
  }

  const nextImage = () => {
    // Reset zoom when changing images
    setModalZoomLevel(1)
    setModalPanPosition({ x: 0, y: 0 })
    setModalIndex((prev) => (prev + 1) % imageList.length)
  }

  const prevImage = () => {
    // Reset zoom when changing images
    setModalZoomLevel(1)
    setModalPanPosition({ x: 0, y: 0 })
    setModalIndex((prev) => (prev - 1 + imageList.length) % imageList.length)
  }

  // Modal zoom controls
  const zoomIn = () => {
    setModalZoomLevel(prev => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setModalZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.25, 1)
      // If zooming back to 1, reset pan position
      if (newZoom === 1) {
        setModalPanPosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  const resetZoom = () => {
    setModalZoomLevel(1)
    setModalPanPosition({ x: 0, y: 0 })
  }

  // Handle mouse wheel zoom in modal
  const handleWheel = (e) => {
    if (!showGalleryModal) return
    
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }

  // Handle dragging in modal when zoomed
  const handleMouseDown = (e) => {
    if (modalZoomLevel > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && modalZoomLevel > 1) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      
      setModalPanPosition(prev => ({ 
        x: prev.x + dx / (modalZoomLevel * 2), 
        y: prev.y + dy / (modalZoomLevel * 2)
      }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showGalleryModal) return
      
      if (e.key === 'ArrowRight') nextImage()
      else if (e.key === 'ArrowLeft') prevImage()
      else if (e.key === 'Escape') closeGallery()
      else if (e.key === '+' || e.key === '=') zoomIn()
      else if (e.key === '-') zoomOut()
      else if (e.key === '0') resetZoom()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showGalleryModal])

  // Cleanup overflow style on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Main product image with zoom functionality */}
      <div 
        className="relative border rounded-lg overflow-hidden bg-white dark:bg-gray-800 cursor-zoom-in" 
        ref={zoomContainerRef}
        onMouseEnter={() => setIsZoomed(true)} 
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleZoom}
        onClick={() => openGallery(selectedImage)}
      >
        {/* Base image (shown when not zoomed) */}
        <div 
          className={`transition-opacity duration-200 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}
          ref={mainImageRef}
        >
          <Image
            src={imageList[selectedImage] || "/placeholder.svg"}
            alt="Product image"
            width={600}
            height={600}
            priority
            className="w-full h-auto object-contain aspect-square"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>

        {/* Zoomed image */}
        {isZoomed && (
          <div 
            className="absolute top-0 left-0 w-full h-full overflow-hidden"
            style={{
              backgroundImage: `url(${imageList[selectedImage] || "/placeholder.svg"})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: '200%',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}

        {/* Fullscreen icon */}
        <button 
          className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 transition-colors z-10"
          onClick={(e) => {
            e.stopPropagation()
            openGallery(selectedImage)
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>

      {/* Thumbnail navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {imageList.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={`border rounded-md overflow-hidden flex-shrink-0 transition-all ${
              selectedImage === index 
                ? "ring-2 ring-indigo-500 dark:ring-indigo-400 scale-95" 
                : "hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600"
            }`}
            aria-label={`View product image ${index + 1}`}
          >
            <div className="w-20 h-20 relative">
              <Image
                src={image || "/placeholder.svg"}
                alt={`Product thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Fullscreen Gallery Modal */}
      {showGalleryModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex flex-col justify-center items-center"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: modalZoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          {/* Fixed Close Button - Improved positioning and hit area */}
          <div className="absolute top-4 right-4 z-50">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                closeGallery();
              }}
              className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full text-white shadow-lg"
              aria-label="Close gallery view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image counter */}
          <div className="absolute top-4 left-4 bg-gray-800/50 rounded-full px-4 py-1 text-white text-sm">
            {modalIndex + 1} / {imageList.length}
          </div>
          
          {/* Zoom controls */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-gray-800/50 rounded-full px-4 py-1">
            <button 
              onClick={zoomOut}
              disabled={modalZoomLevel <= 1}
              className={`p-1 text-white ${modalZoomLevel <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-300'}`}
              aria-label="Zoom out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-white text-sm font-medium">{Math.round(modalZoomLevel * 100)}%</span>
            <button 
              onClick={zoomIn}
              disabled={modalZoomLevel >= 3}
              className={`p-1 text-white ${modalZoomLevel >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-300'}`}
              aria-label="Zoom in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button 
              onClick={resetZoom}
              disabled={modalZoomLevel === 1}
              className={`p-1 text-white ${modalZoomLevel === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-300'}`}
              aria-label="Reset zoom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* Previous button */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 p-2 bg-gray-800/50 rounded-full text-white hover:bg-gray-700/50 transition-colors z-10"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Gallery Image with zoom */}
            <div 
              className="max-h-[80vh] max-w-[90vw] relative transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${modalZoomLevel}) translate(${modalPanPosition.x}px, ${modalPanPosition.y}px)`,
                transformOrigin: 'center center'
              }}
              ref={modalImageRef}
            >
              <Image
                src={imageList[modalIndex] || "/placeholder.svg"}
                alt={`Product image ${modalIndex + 1}`}
                width={1200}
                height={1200}
                className="object-contain max-h-[80vh] max-w-[90vw]"
                unoptimized={modalZoomLevel > 1} // Skip optimization for better zoom quality
                draggable="false"
              />
            </div>

            {/* Next button */}
            <button 
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 p-2 bg-gray-800/50 rounded-full text-white hover:bg-gray-700/50 transition-colors z-10"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Zoom instruction tooltip */}
          {modalZoomLevel === 1 && (
            <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800/70 rounded-md px-4 py-2 text-white text-sm text-center">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Use mouse wheel or buttons to zoom. Click and drag to pan when zoomed.
              </p>
            </div>
          )}

          {/* Thumbnail strip */}
          <div className="fixed bottom-6 left-0 right-0">
            <div className="flex justify-center space-x-2 px-4 overflow-x-auto scrollbar-thin">
              {imageList.map((image, index) => (
                <button
                  key={`modal-thumb-${index}`}
                  onClick={() => {
                    setModalIndex(index)
                    resetZoom() // Reset zoom when changing images
                  }}
                  className={`border-2 rounded-md overflow-hidden transition-all ${
                    modalIndex === index 
                      ? "border-white" 
                      : "border-gray-500 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View gallery image ${index + 1}`}
                >
                  <div className="w-16 h-16 relative">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Gallery thumbnail ${index + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #c5c5c5;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #a0a0a0;
        }
        @media (prefers-color-scheme: dark) {
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #374151;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #4b5563;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        }
      `}</style>
    </div>
  )
}