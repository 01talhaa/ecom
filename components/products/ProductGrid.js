import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";

export default function ProductGrid({ products, viewMode }) {
  // Function to calculate discounted price if not already provided
  const calculateDiscountedPrice = (product) => {
    if (product.originalPrice && product.discountRate) {
      if (product.discountType === "Percentage") {
        return product.originalPrice - product.originalPrice * (product.discountRate / 100);
      } else {
        return product.originalPrice - product.discountRate;
      }
    }
    return product.originalPrice || 0;
  };

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => {
          const discountedPrice = product.discountedPrice || calculateDiscountedPrice(product);
          const hasDiscount = product.discountRate > 0;

          return (
            <div
              key={product.productId}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col sm:flex-row"
            >
              <div className="relative w-full sm:w-1/4 h-48 sm:h-auto">
                {/* Image */}
                <Link href={`/products/${product.slug}`}>
                  <div className="relative w-full h-48">
                    <Image
                      src={product.thumbnail || "/placeholder-image.jpg"}
                      alt={product.productName}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.featured && (
                    <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded">Featured</span>
                  )}
                  {hasDiscount && (
                    <span className="bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                      {product.discountRate}% OFF
                    </span>
                  )}
                  {product.stockQuantity <= 0 && (
                    <span className="bg-gray-700 text-white text-xs font-medium px-2 py-0.5 rounded">Out of Stock</span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.categoryName}</p>

                  {/* Product Name */}
                  <Link href={`/products/${product.productId}`}>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition">
                      {product.productName}
                    </h3>
                  </Link>

                  {/* Brand */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Brand: <span className="font-medium">{product.brandName}</span>
                  </p>

                  {/* Description */}
                  <div
                    className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4"
                    dangerouslySetInnerHTML={{ __html: product.productDescription }}
                  />

                  {/* Ratings & Likes */}
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(product.ratings) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">({product.ratings || 0})</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="ml-1 text-gray-500 dark:text-gray-400">{product.likesCount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-end justify-between mt-auto">
                  {/* Price */}
                  <div>
                    {hasDiscount && (
                      <span className="text-gray-500 dark:text-gray-400 line-through text-sm mr-2">
                        ${product.originalPrice?.toFixed(2) || "0.00"}
                      </span>
                    )}
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ${discountedPrice?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      className={`p-2 rounded-full ${
                        product.stockQuantity > 0
                          ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      }`}
                      disabled={product.stockQuantity <= 0}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <button
                      className={`flex items-center px-3 py-2 rounded-full ${
                        product.stockQuantity > 0
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                      }`}
                      disabled={product.stockQuantity <= 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      <span>{product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const discountedPrice = product.discountedPrice || calculateDiscountedPrice(product);
        const hasDiscount = product.discountRate > 0;

        return (
          <div key={product.productId} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
            {/* Product Image */}
            <div className="relative h-48 overflow-hidden">
              <Link href={`/products/${product.slug}`}>
                <div className="w-full h-full">
                  <Image
                    src={product.thumbnail || "/placeholder-image.jpg"}
                    alt={product.productName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              </Link>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.featured && (
                  <span className="bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded">Featured</span>
                )}
                {hasDiscount && (
                  <span className="bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                    {product.discountRate}% OFF
                  </span>
                )}
                {product.stockQuantity <= 0 && (
                  <span className="bg-gray-700 text-white text-xs font-medium px-2 py-0.5 rounded">Out of Stock</span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="absolute top-2 right-2">
                <button className="p-1.5 bg-white/80 hover:bg-white rounded-full text-gray-800 hover:text-red-500 transition-colors backdrop-blur-sm">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex-1 flex flex-col">
              <div className="mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">{product.categoryName}</p>
              </div>

              <Link href={`/products/${product.productId}`}>
                <h3 className="font-medium text-gray-800 dark:text-white mb-1 line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  {product.productName}
                </h3>
              </Link>

              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(product.ratings) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({product.ratings || 0})</span>
              </div>

              <div className="mt-auto">
                <div className="flex items-end justify-between">
                  <div>
                    {hasDiscount && (
                      <span className="text-gray-500 dark:text-gray-400 line-through text-xs mr-1">
                        ${product.originalPrice?.toFixed(2) || "0.00"}
                      </span>
                    )}
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${discountedPrice?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  <button
                    className={`p-2 rounded-full ${
                      product.stockQuantity > 0
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                    }`}
                    disabled={product.stockQuantity <= 0}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}