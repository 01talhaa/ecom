import Link from "next/link";
import Image from "next/image"; // Import Next Image
import { getCategories } from "@/lib/api";

export default async function CategoryShowcase() {
  const categories = await getCategories();

  return (
    <div className="py-16 bg-gray-50/5">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
          <div className="h-1 w-20 bg-indigo-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="relative group overflow-hidden rounded-xl shadow-lg h-72 transform transition duration-300 hover:shadow-2xl"
            >
              <Image
                src={category.imageUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi2gfiWgwwHQWrcKgWX3nw4X2bZ5t5xCV2pw&s"} // Use category image URL
                alt={category.name}
                fill // Make the image fill the container
                style={{ objectFit: "cover" }} // Ensure the image covers the container
                className="absolute inset-0 transform transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 p-6 w-full transform transition-transform duration-300 group-hover:translate-y-[-5px]">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {category.name}
                </h3>
                <div className="flex items-center">
                  <p className="text-white/90 text-sm font-medium">
                    Shop Collection
                  </p>
                  <svg
                    className="w-4 h-4 ml-2 text-white/80 group-hover:translate-x-1 transition-transform"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
                <div className="h-0.5 w-0 bg-white/70 mt-3 group-hover:w-full transition-all duration-300"></div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <span>See All Categories</span>
            <svg
              className="w-5 h-5 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}