import Link from "next/link"
import Image from "next/image"

export default function RelatedProducts({ products }) {
  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.ProductId} href={`/products/${product.Slug}`} className="group">
            <div className="card overflow-hidden transition-transform group-hover:shadow-lg">
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={product.Thumbnail || "/placeholder.svg"}
                  alt={product.productName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {product.productName}
                </h3>
                <div className="mt-2 flex items-center">
                  <span className="text-lg font-bold text-gray-900">${product.DiscountedPrice}</span>
                  {product.DiscountRate > 0 && (
                    <span className="ml-2 text-sm text-gray-500 line-through">${product.OriginalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

