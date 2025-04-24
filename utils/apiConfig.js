/**
 * API configuration utility to handle different environments
 */

// Get the correct API base URL depending on environment
export const getApiBaseUrl = () => {
  // Check for environment variables first
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // For client-side code in production
  if (typeof window !== 'undefined') {
    // If we're on the production domain
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('tratechbd.com')) {
      return 'https://api.tratechbd.com';
    }
    // For local development
    return '/api/proxy';
  }
  
  // Default fallback (server-side in production)
  return 'https://api.tratechbd.com';
};

// Helper to construct full API URLs
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Specific API endpoints
export const API_ENDPOINTS = {
  UPLOAD_PRODUCT_IMAGE: '/api/v1/product/uploadImage',
  UPLOAD_PRODUCT_VIDEO: '/api/v1/product/uploadVedio',
  UPLOAD_PRODUCT_FILES: '/api/v1/product/uploadFiles',
  GET_PRODUCTS: '/api/v1/products',
  GET_PRODUCT: (id) => `/api/v1/products/${id}`,
  CREATE_PRODUCT: '/api/v1/products',
  UPDATE_PRODUCT: (id) => `/api/v1/products/${id}`,
  DELETE_PRODUCT: (id) => `/api/v1/products/${id}`,
  // Add other endpoints as needed
};