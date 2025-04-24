export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="h-10 w-full md:w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md animate-pulse">
            <div className="p-6">
              <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 rounded-md mb-4"></div>
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}