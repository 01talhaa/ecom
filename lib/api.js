// This is a mock API service for demo purposes
// In a real application, you would connect to your backend API

// Mock data for products
const mockProducts = [
  {
    ProductId: "1",
    productName: "Premium Cotton T-Shirt",
    Barcode: "123456789012",
    Description: "A comfortable cotton t-shirt perfect for everyday wear.",
    CategoryId: "1",
    CategoryName: "Clothing",
    SubCategoryId: "2",
    ReturnPolicyId: "5",
    BrandId: "7",
    BrandName: "FashionBrand",
    UnitId: "piece",
    Slug: "premium-cotton-tshirt",
    RackNumber: "A1",
    CellNumber: "C5",
    Rating: 4.5,
    ReorderNumber: 10,
    VatAmount: 10,
    VatEnable: true,
    VatType: "Percentage",
    Images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    Thumbnail: "/placeholder.svg",
    UserReacted: false,
    Likes: [100, 101, 102],
    LikesCount: 120,
    Comments: ["Great product!", "Excellent quality"],
    CommentsCount: 2,
    Tags: ["clothing", "tshirt"],
    Faq: [
      { question: "What is the material?", answer: "100% cotton." },
      { question: "Is it machine washable?", answer: "Yes, cold wash recommended." },
    ],
    Status: "Available",
    CreatedBy: "admin",
    CreatedTime: "2025-02-01T12:00:00Z",
    ModifiedBy: "admin",
    ModifiedTime: "2025-02-05T12:00:00Z",
    StockQuantity: 50,
    MinStockLevel: 10,
    MaxStockLevel: 100,
    OriginalPrice: 25.0,
    DiscountType: "flat",
    DiscountRate: 5.0,
    DiscountedPrice: 20.0,
    ExpiredDate: "2025-12-31T12:00:00Z",
    Currency: "BDT",
    Weight: 0.2,
    Dimensions: { length: 30, width: 20, height: 2 },
    ShippingCost: 5.0,
    Variants: [
      {
        VariantId: "101",
        VariantName: "Small",
        VariantPrice: 20.0,
        VariantStockLevel: 15,
        VariantBarcode: "123-S",
      },
      {
        VariantId: "102",
        VariantName: "Medium",
        VariantPrice: 20.0,
        VariantStockLevel: 20,
        VariantBarcode: "123-M",
      },
      {
        VariantId: "103",
        VariantName: "Large",
        VariantPrice: 20.0,
        VariantStockLevel: 15,
        VariantBarcode: "123-L",
      },
    ],
    SalesCount: 200,
    Featured: true,
    MetaTitle: "Premium Cotton T-Shirt - Best Seller",
    MetaDescription: "Find the best cotton t-shirt at the best price!",
    MetaKeywords: "tshirt, cotton, clothing",
    CanonicalURL: "/product/premium-cotton-tshirt",
    LaunchDate: "2025-01-01",
    EndDate: "2025-12-31",
    AffiliateLink: "https://affiliate-link.com",
    PromotionId: "10",
    WarehouseLocation: "Warehouse 1",
    Certifications: ["Organic", "Fair Trade"],
    SafetyWarnings: "Keep away from fire.",
  },
  {
    ProductId: "2",
    productName: "Wireless Bluetooth Headphones",
    Barcode: "987654321098",
    Description: "High-quality wireless headphones with noise cancellation.",
    CategoryId: "2",
    CategoryName: "Electronics",
    SubCategoryId: "5",
    ReturnPolicyId: "3",
    BrandId: "12",
    BrandName: "AudioTech",
    UnitId: "piece",
    Slug: "wireless-bluetooth-headphones",
    RackNumber: "B3",
    CellNumber: "D2",
    Rating: 4.8,
    ReorderNumber: 5,
    VatAmount: 15,
    VatEnable: true,
    VatType: "Percentage",
    Images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    Thumbnail: "/placeholder.svg",
    UserReacted: false,
    Likes: [105, 106, 107, 108],
    LikesCount: 150,
    Comments: ["Amazing sound quality!", "Battery life is impressive"],
    CommentsCount: 2,
    Tags: ["electronics", "headphones", "bluetooth"],
    Faq: [
      { question: "What is the battery life?", answer: "Up to 20 hours of playback." },
      { question: "Is it compatible with iPhone?", answer: "Yes, compatible with all Bluetooth devices." },
    ],
    Status: "Available",
    CreatedBy: "admin",
    CreatedTime: "2025-01-15T12:00:00Z",
    ModifiedBy: "admin",
    ModifiedTime: "2025-01-20T12:00:00Z",
    StockQuantity: 30,
    MinStockLevel: 5,
    MaxStockLevel: 50,
    OriginalPrice: 120.0,
    DiscountType: "percentage",
    DiscountRate: 10.0,
    DiscountedPrice: 108.0,
    ExpiredDate: "2025-12-31T12:00:00Z",
    Currency: "BDT",
    Weight: 0.3,
    Dimensions: { length: 18, width: 8, height: 20 },
    ShippingCost: 0.0,
    Variants: [
      {
        VariantId: "201",
        VariantName: "Black",
        VariantPrice: 108.0,
        VariantStockLevel: 15,
        VariantBarcode: "987-B",
      },
      {
        VariantId: "202",
        VariantName: "White",
        VariantPrice: 108.0,
        VariantStockLevel: 15,
        VariantBarcode: "987-W",
      },
    ],
    SalesCount: 120,
    Featured: true,
    MetaTitle: "Wireless Bluetooth Headphones - Premium Sound",
    MetaDescription: "Experience premium sound quality with our wireless headphones!",
    MetaKeywords: "headphones, wireless, bluetooth, audio",
    CanonicalURL: "/product/wireless-bluetooth-headphones",
    LaunchDate: "2025-01-01",
    EndDate: "2025-12-31",
    AffiliateLink: "https://affiliate-link.com",
    PromotionId: "5",
    WarehouseLocation: "Warehouse 2",
    Certifications: ["CE", "FCC"],
    SafetyWarnings: "Do not use while charging.",
  },
  // Add more mock products as needed
]

// Mock data for categories
const mockCategories = [
  { id: "1", name: "Clothing", slug: "clothing" },
  { id: "2", name: "Electronics", slug: "electronics" },
  { id: "3", name: "Home & Kitchen", slug: "home-kitchen" },
  { id: "4", name: "Beauty & Personal Care", slug: "beauty-personal-care" },
]

// Mock data for brands
const mockBrands = [
  { id: "7", name: "FashionBrand" },
  { id: "12", name: "AudioTech" },
  { id: "15", name: "HomeEssentials" },
  { id: "18", name: "BeautyGlow" },
]

// Update the getProducts function in lib/api.js
export async function getProducts() {
  try {
    // Get auth token (needed even for public data in this API)
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken');
    }
    
    if (!token) {
      console.warn("No auth token available for product fetch");
      return [];
    }
    
    const response = await fetch("/api/proxy/api/v1/product", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Return data in the expected format, handling different API response structures
      if (data.data && data.data.result && Array.isArray(data.data.result)) {
        // Map the API data format to match the component's expected format
        return data.data.result.map(product => ({
          productId: product.productId,
          ProductId: product.productId, // Also include uppercase for compatibility
          productName: product.productName,
          ProductName: product.productName, // Include uppercase version for compatibility
          slug: product.slug,
          Slug: product.slug, // Include uppercase version for compatibility
          Description: product.productDescription,
          categoryId: product.categoryId,
          CategoryId: product.categoryId, // Also include uppercase for compatibility
          CategoryName: product.categoryName || "Uncategorized",
          BrandId: product.brandId,
          BrandName: product.brandName,
          OriginalPrice: product.originalPrice || 0,
          DiscountedPrice: product.discountedPrice || 0,
          DiscountRate: product.discountRate || 0,
          discountRate: product.discountRate || 0,
          DiscountType: product.discountType || "percentage",
          thumbnail: product.thumbnail,
          Thumbnail: product.thumbnail, // Include uppercase version for compatibility
          StockQuantity: product.stockQuantity || 0,
          stockQuantity: product.stockQuantity || 0,
          Rating: product.ratings || 4,
          rating: product.ratings || 4,
          CreatedDate: product.createdDate || new Date().toISOString(),
          status: product.status !== false // Only include products that are active
        }));
      } else if (Array.isArray(data.data)) {
        // Handle alternate data structure
        return data.data.map(product => ({
          // Similar mapping as above
          productId: product.productId,
          ProductId: product.productId,
          productName: product.productName,
          // ... other fields
        }));
      }
      return [];
    } else {
      console.warn("API returned failure:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

// Update getProductBySlug in lib/api.js
export async function getProductBySlug(slug) {
  try {
    // Get auth token
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken');
    }
    
    if (!token) {
      console.warn("No auth token available for product fetch");
      return null;
    }
    
    // First try to find the product ID by fetching all products if the slug is not a number
    let productId = null;
    
    // Check if slug is a number (direct ID)
    if (!isNaN(slug) && parseInt(slug) > 0) {
      productId = parseInt(slug);
    } else {
      // Find product ID by slug
      const allProducts = await fetch("/api/proxy/api/v1/product", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!allProducts.ok) {
        throw new Error(`API error: ${allProducts.status}`);
      }
      
      const productsData = await allProducts.json();
      
      if (productsData.success) {
        let products = [];
        
        if (productsData.data && productsData.data.result && Array.isArray(productsData.data.result)) {
          products = productsData.data.result;
        } else if (Array.isArray(productsData.data)) {
          products = productsData.data;
        }
        
        const product = products.find(p => 
          (p.slug === slug) || (p.Slug === slug)
        );
        
        if (product) {
          productId = product.productId || product.ProductId;
        }
      }
    }
    
    // If we couldn't determine the productId, return null
    if (!productId) {
      console.warn("Could not find product ID for slug:", slug);
      return null;
    }
    
    // Now fetch the product directly by ID
    const response = await fetch(`/api/proxy/api/v1/product/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.warn("API returned failure:", data.message);
      return null;
    }
    
    const product = data.data;
    
    // Format the product for the UI
    return {
      id: product.productId,
      productId: product.productId,
      productName: product.productName,
      Description: product.productDescription,
      slug: product.slug,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      CategoryName: product.categoryName || "Uncategorized",
      SubCategoryName: product.subCategoryName,
      CategorySlug: product.categorySlug || product.slug || "uncategorized",
      BrandName: product.brandName,
      BrandId: product.brandId,
      BrandSlug: product.brandSlug || "brand",
      UnitName: product.unitName,
      UnitId: product.unitId,
      OriginalPrice: product.originalPrice || 0,
      DiscountedPrice: product.discountedPrice || 0,
      DiscountRate: product.discountRate || 0,
      DiscountType: product.discountType || "percentage",
      ShippingCost: product.shippingCost || 0,
      StockQuantity: product.stockQuantity || 0,
      SKU: product.barcode,
      Rating: product.ratings || 4,
      Reviews: product.commentsCount || 0,
      IsNew: isNewProduct(product),
      IsFeatured: product.featured || false,
      Warranty: product.warranty,
      SafetyWarnings: product.safetyWarnings,
      Images: formatProductImages(product),
      Variants: formatProductVariants(product),
      Specifications: product.specifications || [],
      ExpiredDate: product.expiredDate,
      status: product.status !== false
    };
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
}

// Helper functions
function formatProductImages(product) {
  const images = [];
  
  // Add thumbnail as first image
  if (product.thumbnail) {
    images.push({
      id: 'thumbnail', 
      url: product.thumbnail,
      alt: product.productName || 'Product thumbnail'
    });
  }
  
  // Add other images
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img, index) => {
      images.push({
        id: img.imageId || `image-${index}`,
        url: img.imagePath,
        alt: product.productName || `Product image ${index + 1}`
      });
    });
  }
  
  // Fallback if no images are found
  if (images.length === 0) {
    images.push({
      id: 'placeholder',
      url: '/placeholder.svg',
      alt: 'Product image placeholder'
    });
  }
  
  return images;
}

function formatProductVariants(product) {
  if (!product.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    return [];
  }
  
  return product.variants.map((variant, index) => ({
    VariantId: variant.variantId || `variant-${index}`,
    VariantName: variant.variantName || `Variant ${index + 1}`,
    VariantPrice: variant.variantPrice || product.discountedPrice || 0,
    VariantStockLevel: variant.variantStockLevel || 0
  }));
}

function isNewProduct(product) {
  // Check if product was created within the last 14 days
  const expiredDate = product.expiredDate;
  if (!expiredDate) return false;
  
  const expDate = new Date(expiredDate);
  const currentDate = new Date();
  
  // Product is new if expiration date is in the future
  return expDate > currentDate;
}

// Get related products
export async function getRelatedProducts(categoryId) {
  try {
    // If no categoryId is provided, return empty array
    if (!categoryId) {
      console.warn("No categoryId provided for related products");
      return [];
    }
    
    // Get auth token
    let token = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('authToken');
    }
    
    if (!token) {
      console.warn("No auth token available for product fetch");
      return [];
    }
    
    // Fetch all products in the same category
    const response = await fetch(`/api/proxy/api/v1/product?categoryId=${categoryId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.warn("API returned failure:", data.message);
      return [];
    }
    
    // Get related products from the same category
    let related = [];
    
    if (data.data && data.data.result && Array.isArray(data.data.result)) {
      related = data.data.result
        .filter(p => p.productId !== parseInt(categoryId)) // Exclude current product
        .slice(0, 4); // Limit to 4 related products
    }
    
    // Format the products for display
    return related.map(product => ({
      id: product.productId,
      productName: product.productName,
      Description: product.productDescription,
      slug: product.slug,
      OriginalPrice: product.originalPrice || 0,
      DiscountedPrice: product.discountedPrice || 0,
      DiscountRate: product.discountRate || 0,
      thumbnail: product.thumbnail,
      StockQuantity: product.stockQuantity || 0,
      Rating: product.ratings || 4,
      CategoryName: product.categoryName
    }));
    
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
}

// Get all categories
export async function getCategories() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockCategories
}

// Get all brands
export async function getBrands() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockBrands
}

