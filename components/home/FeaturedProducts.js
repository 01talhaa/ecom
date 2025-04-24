import Link from "next/link"
import Image from "next/image"
import { getProducts } from "@/lib/api"

export default async function FeaturedProducts() {
  const allProducts = await getProducts()
  const featuredProducts = allProducts.filter((product) => product.Featured).slice(0, 4)

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
            <div className="h-1 w-16 bg-indigo-600 mt-2 rounded-full"></div>
          </div>
          <Link 
            href="/products" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            View All Products
            <svg className="w-5 h-5 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <Link key={product.ProductId} href={`/products/${product.Slug}`} className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={product.Thumbnail || "/placeholder.svg"}
                    alt={product.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.DiscountRate > 0 && (
                    <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1 m-2 rounded-full">
                      -{product.DiscountRate}%
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-lg">
                    {product.productName}
                  </h3>
                  <div className="flex items-center mt-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-4 h-4 ${i < Math.floor(product.Rating) ? "text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">({product.Rating.toFixed(1)})</span>
                  </div>
                  <div className="mt-3 flex items-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">${product.DiscountedPrice}</span>
                    {product.DiscountRate > 0 && (
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 line-through">${product.OriginalPrice}</span>
                    )}
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="inline-block w-full py-2 text-center bg-indigo-50 dark:bg-indigo-900/30 text-blue-600 dark:text-indigo-300 font-medium rounded-md group-hover:bg-blue-600 dark:group-hover:bg-blue-600 group-hover:text-white dark:group-hover:text-white transition-all duration-300">
                      View Product
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}