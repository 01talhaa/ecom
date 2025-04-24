"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // Import toast for notifications
import BasicInformation from "./BasicInformation";
import Pricing from "./Pricing";
import Inventory from "./Inventory";
import Dimensions from "./Dimensions";
import Specifications from "./Specifications";
import VatAndShipping from "./VatAndShipping";
import WarrantyAndSafety from "./WarrantyAndSafety";
import Seo from "./Seo";
import Images from "./Images";
import Videos from "./Videos";
import Files from "./Files";
import Variants from "./Variants";
import DisplayImage from "./DisplayImage";

// Update the getAuthToken function to handle token refresh if needed
const getAuthToken = async () => {
  // First try to get token from localStorage
  let token = localStorage.getItem("authToken");
  
  if (!token) {
    console.error("No authentication token found in localStorage");
    return null;
  }
  
  // Optional: Add token validation or refresh logic here
  // For example, check if token is expired using JWT decode
  // If expired, you could call a refresh token endpoint
  
  return token;
};

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    barcode: "",  // Keep as string in form but will convert to number on submit
    model: "",    // Add the model field
    categoryId: "",
    subCategoryId: "",
    brandId: "",
    unitId: "",
    originalPrice: "",
    discountedPrice: "",
    discountRate: "0",
    discountType: "Percentage",
    discountEnable: false,
    stockQuantity: "",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    images: [],
    videos: [],
    files: [],
    variants: [{ name: "", price: "", stock: "", barcode: "" }],
    featured: false,
    status: "Available",
    vatEnable: false,
    vatType: "Percentage",
    vatAmount: "0",
    warranty: "",
    safetyWarnings: "",
    shippingCost: "0",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalURL: "",
    specifications: [{ titleText: "", paramName: "", paramValue: "" }],
  });
  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideos, setPreviewVideos] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [specificationTitles, setSpecificationTitles] = useState([]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0]
  );

  // Add state for the Variants toggle
  const [variantsEnabled, setVariantsEnabled] = useState(false);

  // Add state for display image
  const [displayImage, setDisplayImage] = useState(null);
  const [displayImageUrl, setDisplayImageUrl] = useState(null);

  // Add state for tracking upload status
  const [uploadStatus, setUploadStatus] = useState({
    displayImage: { loading: false, progress: 0, error: null },
    images: { loading: false, progress: 0, error: null },
    videos: { loading: false, progress: 0, error: null },
    files: { loading: false, progress: 0, error: null }
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Get auth token
        const token = await getAuthToken();
        if (!token) {
          throw new Error("Authentication token is missing");
        }

        // Fetch categories, brands, and units in parallel
        const [
          categoriesResponse,
          brandsResponse,
          unitsResponse,
          specTitlesResponse,
        ] = await Promise.all([
          fetch("/api/proxy/api/v1/category", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/proxy/api/v1/brand", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/proxy/api/v1/unit", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          // Add this new request to fetch specification titles
          fetch("/api/proxy/api/specificationtitle", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!categoriesResponse.ok) {
          throw new Error(
            `Failed to fetch categories: ${categoriesResponse.status}`
          );
        }

        if (!brandsResponse.ok) {
          throw new Error(`Failed to fetch brands: ${brandsResponse.status}`);
        }

        if (!unitsResponse.ok) {
          throw new Error(`Failed to fetch units: ${unitsResponse.status}`);
        }

        // Check if the specification titles response is ok
        if (!specTitlesResponse.ok) {
          console.warn(
            `Failed to fetch specification titles: ${specTitlesResponse.status}`
          );
        } else {
          const specTitlesData = await specTitlesResponse.json();

          // Process the specification titles response
          const processedSpecTitles =
            specTitlesData.success &&
            specTitlesData.data &&
            specTitlesData.data.result
              ? specTitlesData.data.result.map((title) => ({
                  id: title.titleId,
                  name: title.titleName,
                }))
              : [];

          setSpecificationTitles(processedSpecTitles);
        }

        const categoriesData = await categoriesResponse.json();
        const brandsData = await brandsResponse.json();
        const unitsData = await unitsResponse.json();

        // Process the response data
        const processedCategories =
          categoriesData.success &&
          categoriesData.data &&
          categoriesData.data.result
            ? categoriesData.data.result.map((cat) => ({
                id: cat.categoryId,
                name: cat.categoryName,
              }))
            : [];

        const processedBrands =
          brandsData.success && brandsData.data && brandsData.data.result
            ? brandsData.data.result.map((brand) => ({
                id: brand.brandId,
                name: brand.brandName,
              }))
            : [];

        const processedUnits =
          unitsData.success && unitsData.data && unitsData.data.result
            ? unitsData.data.result.map((unit) => ({
                id: unit.unitId,
                name: unit.unitName,
                value: unit.unitValue,
              }))
            : [];

        setCategories(processedCategories);
        setBrands(processedBrands);
        setUnits(processedUnits);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors((prev) => ({ ...prev, fetch: error.message }));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const fetchSubcategories = async (categoryId) => {
    try {
      setLoading(true);

      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      // Fetch subcategories for the selected category
      const response = await fetch(
        `/api/proxy/api/v1/subcategory?categoryId=${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch subcategories: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Process subcategories data
        const subcategoriesData = data.data.result || [];

        const processedSubcategories = subcategoriesData.map((subcat) => ({
          id: subcat.subCategoryId,
          name: subcat.subCategoryName,
          categoryId: subcat.categoryId,
        }));

        setSubcategories(processedSubcategories);
      } else {
        setSubcategories([]);
        console.warn("No subcategories found:", data.message);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setErrors((prev) => ({ ...prev, fetchSubcategories: error.message }));
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      // When category changes, fetch subcategories and reset the subcategory selection
      if (name === "categoryId" && value) {
        setSelectedCategoryId(value);
        fetchSubcategories(value);

        // Reset subcategory selection
        setFormData((prev) => ({
          ...prev,
          subCategoryId: "",
        }));
      }

      // Add this to handleChange
      if (name === "expiryDate") {
        setExpiryDate(value);
        setFormData((prev) => ({
          ...prev,
          expiredDate: new Date(value).toISOString(),
        }));
      }
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: "", price: "", stock: "", barcode: "" }],
    });
  };

  const removeVariant = (index) => {
    const updatedVariants = [...formData.variants];
    updatedVariants.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }));
  };

  // Generic file upload function that handles all types of uploads
  const uploadFile = async (file, type) => {
    setUploadStatus(prev => ({
      ...prev,
      [type]: { ...prev[type], loading: true, error: null }
    }));
    
    try {
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Authentication token is missing");
      }
      
      // Create FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      // Determine the correct API endpoint based on type
      let endpoint;
      switch (type) {
        case 'displayImage':
          endpoint = '/api/proxy/api/v1/product/uploadImage';
          break;
        case 'images':
          endpoint = '/api/proxy/api/v1/product/uploadImage';
          break;
        case 'videos':
          endpoint = '/api/proxy/api/v1/product/uploadVedio'; // Note: API misspelling is intentional
          break;
        case 'files':
          endpoint = '/api/proxy/api/v1/product/uploadFiles';
          break;
        default:
          throw new Error('Invalid file type');
      }
      
      console.log(`Uploading ${type} to ${endpoint}`);
      
      // Upload the file - IMPORTANT: Don't set Content-Type when sending FormData
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header here - browser will set it automatically with boundary
        },
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = `Upload failed: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error(`Upload failed with status ${response.status}:`, errorData);
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If we can't parse the response as JSON, try to get the text
          try {
            const errorText = await response.text();
            console.error(`Upload failed with status ${response.status}:`, errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error("Could not parse error response", textError);
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const responseData = await response.json();
      console.log(`${type} upload response:`, responseData);
      
      // Handle different response formats
      if (responseData.fileUrl) {
        // Direct fileUrl in response
        return responseData.fileUrl;
      } else if (responseData.success && responseData.data) {
        // Nested data structure
        return responseData.data.fileUrl || responseData.data.url || responseData.data;
      } else if (responseData.url) {
        // Direct url in response
        return responseData.url;
      } else {
        console.error("Unexpected response format:", responseData);
        throw new Error(`Failed to upload ${type}: Unexpected response format`);
      }
      
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      setUploadStatus(prev => ({
        ...prev,
        [type]: { ...prev[type], error: error.message }
      }));
      throw error;
    } finally {
      setUploadStatus(prev => ({
        ...prev,
        [type]: { ...prev[type], loading: false }
      }));
    }
  };
  
  // Enhanced handleImageUpload with better error handling
  // Enhanced handleImageUpload with better error handling
const handleImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  // Check file sizes
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
  
  if (oversizedFiles.length > 0) {
    toast.error(`${oversizedFiles.length} file(s) exceed the 5MB limit`);
    return;
  }
  
  // Create temporary preview URLs
  const newPreviewImages = files.map(file => URL.createObjectURL(file));
  setPreviewImages(prev => [...prev, ...newPreviewImages]);
  
  try {
    // Upload each image and get permanent URLs
    const uploadPromises = files.map(file => uploadFile(file, 'images'));
    
    // Use allSettled to handle partial failures
    const results = await Promise.allSettled(uploadPromises);
    
    // Count successes and failures
    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');
    
    if (successes.length > 0) {
      // Extract URLs from successful uploads
      const uploadedUrls = successes.map(result => result.value);
      console.log('Uploaded image URLs:', uploadedUrls);
      
      // Update form data with the uploaded image URLs - handle them as direct URLs
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls.map(url => ({ url }))]
      }));
      
      // Show success message
      toast.success(`${successes.length} image(s) uploaded successfully`);
    }
    
    if (failures.length > 0) {
      console.error("Some uploads failed:", failures.map(f => f.reason));
      toast.error(`${failures.length} image upload(s) failed`);
      
      // Remove previews for failed uploads
      // This is simplified - you may need to track which files failed
      const previewsToKeep = newPreviewImages.slice(0, successes.length);
      const previewsToRemove = newPreviewImages.slice(successes.length);
      
      previewsToRemove.forEach(preview => URL.revokeObjectURL(preview));
      setPreviewImages(prev => prev.filter(p => !previewsToRemove.includes(p)));
    }
  } catch (error) {
    // Handle general error
    toast.error(`Failed to upload images: ${error.message}`);
    
    // Remove all preview images if upload failed
    newPreviewImages.forEach(preview => URL.revokeObjectURL(preview));
    setPreviewImages(prev => prev.filter(p => !newPreviewImages.includes(p)));
  }
};
  
  // Handle video upload
const handleVideoUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  // Check file sizes
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
  
  if (oversizedFiles.length > 0) {
    toast.error(`${oversizedFiles.length} file(s) exceed the 100MB limit`);
    return;
  }
  
  // Create temporary preview URLs
  const newPreviewVideos = files.map(file => URL.createObjectURL(file));
  setPreviewVideos(prev => [...prev, ...newPreviewVideos]);
  
  try {
    // Upload each video and get permanent URLs
    const uploadPromises = files.map(file => uploadFile(file, 'videos'));
    
    // Use allSettled to handle partial failures
    const results = await Promise.allSettled(uploadPromises);
    
    // Count successes and failures
    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');
    
    if (successes.length > 0) {
      // Extract URLs from successful uploads
      const uploadedUrls = successes.map(result => result.value);
      console.log('Uploaded video URLs:', uploadedUrls);
      
      // Update form data with the uploaded video URLs - handle them as direct URLs
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...uploadedUrls.map(url => ({ url }))]
      }));
      
      // Show success message
      toast.success(`${successes.length} video(s) uploaded successfully`);
    }
    
    if (failures.length > 0) {
      console.error("Some uploads failed:", failures.map(f => f.reason));
      toast.error(`${failures.length} video upload(s) failed`);
      
      // Remove previews for failed uploads
      const previewsToKeep = newPreviewVideos.slice(0, successes.length);
      const previewsToRemove = newPreviewVideos.slice(successes.length);
      
      previewsToRemove.forEach(preview => URL.revokeObjectURL(preview));
      setPreviewVideos(prev => prev.filter(p => !previewsToRemove.includes(p)));
    }
  } catch (error) {
    // Handle general error
    toast.error(`Failed to upload videos: ${error.message}`);
    
    // Remove all preview videos if upload failed
    newPreviewVideos.forEach(preview => URL.revokeObjectURL(preview));
    setPreviewVideos(prev => prev.filter(p => !newPreviewVideos.includes(p)));
  }
};
  
// Handle document/file upload
// Handle document/file upload
const handleFileUpload = async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  // Check file sizes
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
  
  if (oversizedFiles.length > 0) {
    toast.error(`${oversizedFiles.length} file(s) exceed the 20MB limit`);
    return;
  }
  
  // Create preview data
  const fileData = files.map(file => ({
    name: file.name,
    size: file.size,
    type: file.type,
    localUrl: URL.createObjectURL(file)
  }));
  setPreviewFiles(prev => [...prev, ...fileData]);
  
  try {
    // Upload each file one by one (instead of using Promise.all)
    const results = [];
    for (const file of files) {
      try {
        console.log(`Uploading file: ${file.name}`);
        const url = await uploadFile(file, 'files');
        results.push({
          status: 'fulfilled', 
          value: url,
          file: file
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        results.push({
          status: 'rejected',
          reason: error,
          file: file
        });
      }
    }
    
    // Process successful uploads
    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');
    
    if (successes.length > 0) {
      // Create file objects with the original file info and the uploaded URL
      const newFiles = successes.map((result) => {
        return {
          name: result.file.name,
          url: result.value, // Direct URL from the API
          type: result.file.type,
          size: result.file.size
        };
      });
      
      // Update form data with the uploaded files
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
      
      // Show success message
      toast.success(`${successes.length} file(s) uploaded successfully`);
    }
    
    if (failures.length > 0) {
      console.error("Some uploads failed:", failures.map(f => f.reason));
      toast.error(`${failures.length} file upload(s) failed`);
      
      // Remove previews for failed uploads
      failures.forEach((failure) => {
        const previewToRemove = fileData.find(f => f.name === failure.file.name);
        if (previewToRemove) {
          URL.revokeObjectURL(previewToRemove.localUrl);
        }
      });
      
      // Update preview files - remove failed ones
      setPreviewFiles(prev => 
        prev.filter(p => !failures.some(f => f.file.name === p.name))
      );
    }
  } catch (error) {
    // Handle general error
    toast.error(`Failed to upload files: ${error.message}`);
    
    // Remove all preview files if upload failed
    fileData.forEach(file => URL.revokeObjectURL(file.localUrl));
    setPreviewFiles(prev => prev.filter(p => !fileData.some(f => f.name === p.name)));
  }
};
  
  // Remove functions for each file type
  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    
    const updatedPreviews = [...previewImages];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    
    setFormData(prev => ({ ...prev, images: updatedImages }));
    setPreviewImages(updatedPreviews);
  };
  
  const removeVideo = (index) => {
    const updatedVideos = [...formData.videos];
    updatedVideos.splice(index, 1);
    
    const updatedPreviews = [...previewVideos];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    
    setFormData(prev => ({ ...prev, videos: updatedVideos }));
    setPreviewVideos(updatedPreviews);
  };
  
  const removeFile = (index) => {
    const updatedFiles = [...formData.files];
    updatedFiles.splice(index, 1);
    
    const updatedPreviews = [...previewFiles];
    URL.revokeObjectURL(updatedPreviews[index].localUrl);
    updatedPreviews.splice(index, 1);
    
    setFormData(prev => ({ ...prev, files: updatedFiles }));
    setPreviewFiles(updatedPreviews);
  };

  // Add handler for display image upload
  const handleDisplayImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit");
      return;
    }
    
    // Create temporary preview URL
    const previewUrl = URL.createObjectURL(file);
    setDisplayImage(previewUrl);
    
    try {
      // Upload the display image
      const uploadedUrl = await uploadFile(file, 'displayImage');
      console.log('Uploaded display image URL:', uploadedUrl);
      
      // Store the URL from the server
      setDisplayImageUrl(uploadedUrl);
      
      // Show success message
      toast.success("Display image uploaded successfully");
    } catch (error) {
      // Handle error
      toast.error(`Failed to upload display image: ${error.message}`);
      
      // Remove preview if upload failed
      URL.revokeObjectURL(previewUrl);
      setDisplayImage(null);
    }
  };

  // Add handler to remove display image
  const removeDisplayImage = () => {
    if (displayImage) {
      URL.revokeObjectURL(displayImage);
    }
    setDisplayImage(null);
    setDisplayImageUrl(null);
  };

  // Update the validateForm function to remove mandatory specification validation
  // Update the validateForm function to make price, inventory, and VAT fields optional
const validateForm = () => {
  const newErrors = {};

  // Required fields
  if (!formData.productName.trim())
    newErrors.productName = "Product name is required";
  if (!formData.description.trim())
    newErrors.description = "Description is required";
  if (!formData.categoryId) 
    newErrors.categoryId = "Category is required";
  if (!formData.subCategoryId)
    newErrors.subCategoryId = "Subcategory is required";
  if (!formData.brandId) 
    newErrors.brandId = "Brand is required";
  if (!formData.unitId) 
    newErrors.unitId = "Unit is required";

  // Make price fields optional by removing their validation
  // REMOVED: Price validation

  // Make inventory fields optional by removing their validation
  // REMOVED: Stock quantity validation

  // Only validate VAT if it's enabled
  if (
    formData.vatEnable &&
    (!formData.vatAmount ||
      isNaN(formData.vatAmount) ||
      Number.parseFloat(formData.vatAmount) < 0)
  ) {
    newErrors.vatAmount = "Valid VAT amount is required when VAT is enabled";
  }

  // Only validate shipping cost if a value is entered
  if (
    formData.shippingCost &&
    (isNaN(formData.shippingCost) || Number.parseFloat(formData.shippingCost) < 0)
  ) {
    newErrors.shippingCost = "Shipping cost must be a positive number";
  }

  // Validate variants if any exist
  const filledVariants = formData.variants.filter(v => v.name.trim() !== "");
  const invalidVariants = filledVariants.filter(
    (v) => (v.price.trim() === "" || isNaN(v.price) || v.stock.trim() === "" || isNaN(v.stock))
  );

  if (filledVariants.length > 0 && invalidVariants.length > 0) {
    newErrors.variants = "All variants must have a name, valid price, and valid stock quantity";
  }

  // Handle specification validation as before
  const invalidSpecs = formData.specifications.filter(
    (spec) =>
      (spec.paramName.trim() !== "" || spec.paramValue.trim() !== "") &&
      (!spec.titleText.trim() || !spec.paramName.trim() || !spec.paramValue.trim())
  );

  if (invalidSpecs.length > 0) {
    newErrors.specifications = "All specifications must have a title, name, and value";
  }

  // Add validation for display image if you want to make it required
  if (!displayImageUrl) {
    newErrors.displayImage = "A main product image is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // Update the handleSubmit function to include the displayImageUrl in the payload
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("Authentication token is missing");
      }
  
      // Current date for expiration (set to 1 year from now by default)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
      // Get the user ID from localStorage or auth context
      const userId = 3; // Replace with actual user ID from authentication context
  
      // Process specifications only if they are provided and complete
      const validSpecifications = formData.specifications
        .filter(spec => 
          spec.titleText && spec.paramName && spec.paramValue && 
          spec.titleText.trim() !== "" && 
          spec.paramName.trim() !== "" && 
          spec.paramValue.trim() !== ""
        )
        .map(spec => {
          // Find the matching titleId based on titleText
          const titleObj = specificationTitles.find(title => 
            title.name.toLowerCase() === spec.titleText.toLowerCase()
          );
          
          const titleId = spec.titleId || (titleObj?.id || 0);
          
          return {
            specificationId: 0,
            productId: 0,
            titleId: titleId,
            titleText: spec.titleText,
            paramName: spec.paramName,
            paramValue: spec.paramValue,
            status: true,
            createdBy: userId,
          };
        });
  
      // Convert form data to match API requirements
      const productPayload = {
        productId: 0,
        // Convert barcode to integer or use a timestamp-based integer if empty
        barcode: formData.barcode ? parseInt(formData.barcode, 10) : Date.now(),
        // Add model field
        model: formData.model || formData.productName.substring(0, 20),
        productName: formData.productName,
        productDescription: formData.description,
        slug: formData.productName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        categoryId: parseInt(formData.categoryId),
        subCategoryId: parseInt(formData.subCategoryId),
        returnPolicyId: 0,
        brandId: parseInt(formData.brandId),
        unitId: parseInt(formData.unitId),
        rackId: 0,
        cellId: 0,
        reorderNumber: 0,
        
        // Provide default values for price-related fields
        vatEnable: formData.vatEnable || false,
        vatType: formData.vatType || "Percentage",
        vatAmount: parseFloat(formData.vatAmount || 0),
        discountEnable: formData.discountEnable || false,
        discountType: formData.discountType || "Percentage",
        discountRate: parseFloat(formData.discountRate || 0),
        
        warranty: formData.warranty || "",
        safetyWarnings: formData.safetyWarnings || "",
        userReacted: false,
        featured: formData.featured,
        expiredDate: formData.expiredDate || oneYearFromNow.toISOString(),
        // Use the uploaded display image URL as the thumbnail
        thumbnail: displayImageUrl || "",
        status: true,
        createdBy: userId,
  
        // SEO data
        seo: {
          seoId: 0,
          productId: 0,
          metaTitle: formData.metaTitle || formData.productName,
          metaDescription:
            formData.metaDescription || formData.description.substring(0, 160),
          metaKeywords: formData.metaKeywords || "",
          canonicalURL: formData.canonicalURL || "",
          status: true,
          createdBy: userId,
        },
  
        // Process images
        images: formData.images.map((image) => ({
          imageId: 0,
          productId: 0,
          imageUrl: image.url || "",  // Use the URL returned from the upload API
          status: true,
          createdBy: userId,
        })),
        
        // Add videos to the payload
        videos: formData.videos.map((video) => ({
          videoId: 0,
          productId: 0,
          videoUrl: video.url || "",
          status: true,
          createdBy: userId,
        })),
        
        // Add files to the payload
        files: formData.files.map((file) => ({
          fileId: 0,
          productId: 0,
          fileName: file.name || "",
          fileUrl: file.url || "",
          fileType: file.type || "",
          status: true,
          createdBy: userId,
        })),
  
        // Process variants
        variants: formData.variants
          .filter((v) => v.name.trim() !== "")
          .map((variant) => ({
            variantId: 0,
            titleId: 0, // This might need to be updated if you have variant titles
            productId: 0,
            // Use the provided barcode or generate one
            variantBarcode: variant.barcode ? 
              parseInt(variant.barcode) : 
              parseInt(`${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10000)}`),
            variantName: variant.name,
            variantPrice: parseFloat(variant.price || 0), // Default to 0 if empty
            variantStockLevel: parseInt(variant.stock || 0),
            status: true,
            createdBy: userId,
          })),
  
        // Only include user-defined specifications
        specifications: validSpecifications,
        
        // Add dimensions as separate properties rather than as specifications
        length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : 0,
        width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : 0,
        height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : 0,
        weight: formData.weight ? parseFloat(formData.weight) : 0,
  
        // Add stock and pricing related fields with default values if missing
        stockQuantity: parseInt(formData.stockQuantity || 0),
        originalPrice: parseFloat(formData.originalPrice || 0),
        discountedPrice: parseFloat(formData.discountedPrice || 0),
        shippingCost: parseFloat(formData.shippingCost || 0),
      };
  
      console.log("Submitting product data:", productPayload);
  
      // Send the data to the API
      const response = await fetch("/api/proxy/api/v1/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.status}`);
      }
  
      const responseData = await response.json();
      console.log("Product created successfully:", responseData);
  
      // Show success message and redirect
      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(`Failed to add product: ${error.message || "Unknown error"}`);
      setErrors({
        submit: `Failed to add product: ${error.message || "Unknown error"}`,
      });
    } finally {
      setLoading(false);
    }
  };
  // Improve the handleSpecificationChange function
  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecifications = [...formData.specifications];
    
    // Update the field with the new value
    updatedSpecifications[index] = {
      ...updatedSpecifications[index],
      [field]: value
    };
    
    // If the titleText changed, update the titleId
    if (field === "titleText" && specificationTitles.length > 0) {
      const matchingTitle = specificationTitles.find(title => 
        title.name === value
      );
      
      if (matchingTitle) {
        console.log(`Found matching title: ${matchingTitle.name} with ID: ${matchingTitle.id}`);
        updatedSpecifications[index].titleId = matchingTitle.id;
      } else {
        console.log(`No matching title found for: ${value}`);
        updatedSpecifications[index].titleId = 0;
      }
    }
    
    setFormData({
      ...formData,
      specifications: updatedSpecifications
    });
  };

  // Update the addSpecification function to include initial titleId
  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [
        ...formData.specifications,
        {
          titleId: 0,
          titleText: "",
          paramName: "",
          paramValue: ""
        }
      ]
    });
  };

  const removeSpecification = (index) => {
    const updatedSpecs = [...formData.specifications];
    updatedSpecs.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      specifications: updatedSpecs,
    }));
  };

    // Function to toggle the Variants
    const toggleVariantsEnabled = () => {
      setVariantsEnabled((prev) => !prev);
    };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Add New Product
          </h1>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

<form onSubmit={handleSubmit}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <BasicInformation
      formData={formData}
      handleChange={handleChange}
      categories={categories}
      subcategories={subcategories}
      brands={brands}
      units={units}
      errors={errors}
      selectedCategoryId={selectedCategoryId}
    />
    {/* Change Pricing component title to indicate optional */}
    {/* <div className="md:col-span-1 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Pricing <span className="text-sm font-normal text-gray-500">(Optional)</span>
      </h2>
      <Pricing
        formData={formData}
        handleChange={handleChange}
        errors={errors}
        optional={true}
      />
    </div> */}
    
    {/* Change Inventory component title to indicate optional */}
    {/* <div className="md:col-span-1 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Inventory <span className="text-sm font-normal text-gray-500">(Optional)</span>
      </h2>
      <Inventory
        formData={formData}
        handleChange={handleChange}
        errors={errors}
        optional={true}
      />
    </div> */}
    
    <Specifications
      formData={formData}
      handleChange={handleSpecificationChange}
      addSpecification={addSpecification}
      removeSpecification={removeSpecification}
      errors={errors}
      specifications={formData.specifications}
      specificationTitles={specificationTitles}
    />
    
    <Variants
      formData={formData}
      handleChange={handleVariantChange}
      addVariant={addVariant}
      removeVariant={removeVariant}
      errors={errors}
      enabled={variantsEnabled}
      onToggleEnabled={toggleVariantsEnabled}
    />
    
    {/* Change VatAndShipping component title to indicate optional */}
    <div className="md:col-span-1 border border-gray-200 dark:border-gray-700 rounded-md p-5">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        VAT and Shipping <span className="text-sm font-normal text-gray-500">(Optional)</span>
      </h2>
      <VatAndShipping
        formData={formData}
        handleChange={handleChange}
        errors={errors}
        optional={true}
      />
    </div>
    
    <WarrantyAndSafety
      formData={formData}
      handleChange={handleChange}
      errors={errors}
    />
    
    <Seo 
      formData={formData} 
      handleChange={handleChange} 
      errors={errors} 
    />
    
    <DisplayImage
      displayImage={displayImage}
      handleDisplayImageUpload={handleDisplayImageUpload}
      removeDisplayImage={removeDisplayImage}
      errors={errors}
      uploadStatus={uploadStatus.displayImage}
    />

    <Images
      formData={formData}
      handleChange={handleImageUpload}
      previewImages={previewImages}
      removeImage={removeImage}
      errors={errors}
      uploadStatus={uploadStatus.images}
    />
    
    <Videos
      formData={formData}
      handleChange={handleVideoUpload}
      previewVideos={previewVideos}
      removeVideo={removeVideo}
      errors={errors}
      uploadStatus={uploadStatus.videos}
    />
  </div>

  <div className="mt-8 flex justify-end">
    <button
      type="button"
      onClick={() => router.push("/admin/products")}
      className="px-4 py-2 mr-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading || uploadStatus.images.loading || uploadStatus.videos.loading || uploadStatus.displayImage.loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {loading ? "Saving..." : "Save Product"}
    </button>
  </div>
</form>
      </div>
    </>
  );
}