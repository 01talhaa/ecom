// components/products/ProductDetailLink.js
import Link from "next/link";

export default function ProductDetailLink({ product, children }) {
  // Determine the correct URL for the product
  const getProductUrl = () => {
    // If product has a slug, use it
    if (product.slug) {
      return `/products/${product.slug}`;
    }
    
    // Otherwise fall back to ID
    const productId = product.productId || product.ProductId;
    
    // If we have an ID, use it
    if (productId) {
      return `/products/${productId}`;
    }
    
    // If all else fails, return a placeholder that will show the "product not found" page
    return `/products/not-found`;
  };
  
  return (
    <Link 
      href={getProductUrl()}
      className="group" 
      prefetch={false}
    >
      {children}
    </Link>
  );
}