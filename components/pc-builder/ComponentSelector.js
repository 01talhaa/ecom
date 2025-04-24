// components/pc-builder/ComponentSelector.js
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePCBuilder } from '@/context/PCBuilderContext';

export default function ComponentSelector({ category, title }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  const { components: selectedComponents, selectComponent, removeComponent } = usePCBuilder();
  
  useEffect(() => {
    // In a real app, fetch from API based on category
    // For now, using mock data
    const fetchComponents = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockComponents = {
          cpu: [
            { id: 'cpu1', name: 'AMD Ryzen 7 5800X', price: 349.99, image: '/placeholder.svg', specs: '8 Cores, 16 Threads, 3.8GHz Base, 4.7GHz Boost' },
            { id: 'cpu2', name: 'Intel Core i7-12700K', price: 389.99, image: '/placeholder.svg', specs: '12 Cores, 20 Threads, 3.6GHz Base, 5.0GHz Boost' },
            { id: 'cpu3', name: 'AMD Ryzen 5 5600X', price: 229.99, image: '/placeholder.svg', specs: '6 Cores, 12 Threads, 3.7GHz Base, 4.6GHz Boost' },
          ],
          motherboard: [
            { id: 'mb1', name: 'ASUS ROG Strix B550-F', price: 179.99, image: '/placeholder.svg', specs: 'ATX, AMD B550, PCIe 4.0, DDR4' },
            { id: 'mb2', name: 'MSI MPG Z690 Edge', price: 289.99, image: '/placeholder.svg', specs: 'ATX, Intel Z690, PCIe 5.0, DDR5' },
            { id: 'mb3', name: 'Gigabyte B660M DS3H', price: 129.99, image: '/placeholder.svg', specs: 'Micro-ATX, Intel B660, PCIe 4.0, DDR4' },
          ],
          ram: [
            { id: 'ram1', name: 'Corsair Vengeance LPX 16GB', price: 79.99, image: '/placeholder.svg', specs: '2x8GB, DDR4-3600, CL18' },
            { id: 'ram2', name: 'G.Skill Trident Z RGB 32GB', price: 169.99, image: '/placeholder.svg', specs: '2x16GB, DDR4-3600, CL16' },
            { id: 'ram3', name: 'Kingston FURY Beast 16GB', price: 89.99, image: '/placeholder.svg', specs: '2x8GB, DDR4-3200, CL16' },
          ],
          storage: [
            { id: 'storage1', name: 'Samsung 970 EVO Plus 1TB', price: 119.99, image: '/placeholder.svg', specs: 'NVMe M.2, 3500MB/s Read, 3300MB/s Write' },
            { id: 'storage2', name: 'WD Black SN850 1TB', price: 149.99, image: '/placeholder.svg', specs: 'NVMe M.2, 7000MB/s Read, 5300MB/s Write' },
            { id: 'storage3', name: 'Crucial MX500 2TB', price: 169.99, image: '/placeholder.svg', specs: 'SATA SSD, 560MB/s Read, 510MB/s Write' },
          ],
          gpu: [
            { id: 'gpu1', name: 'NVIDIA RTX 3070', price: 599.99, image: '/placeholder.svg', specs: '8GB GDDR6, 1.73GHz, 5888 CUDA Cores' },
            { id: 'gpu2', name: 'AMD RX 6800 XT', price: 649.99, image: '/placeholder.svg', specs: '16GB GDDR6, 2.25GHz, 4608 Stream Processors' },
            { id: 'gpu3', name: 'NVIDIA RTX 3060', price: 379.99, image: '/placeholder.svg', specs: '12GB GDDR6, 1.78GHz, 3584 CUDA Cores' },
          ],
          psu: [
            { id: 'psu1', name: 'EVGA SuperNOVA 750 G5', price: 109.99, image: '/placeholder.svg', specs: '750W, Fully Modular, 80+ Gold' },
            { id: 'psu2', name: 'Corsair RM850x', price: 139.99, image: '/placeholder.svg', specs: '850W, Fully Modular, 80+ Gold' },
            { id: 'psu3', name: 'Seasonic FOCUS GX-650', price: 89.99, image: '/placeholder.svg', specs: '650W, Fully Modular, 80+ Gold' },
          ],
          case: [
            { id: 'case1', name: 'Fractal Design Meshify C', price: 99.99, image: '/placeholder.svg', specs: 'ATX Mid Tower, Tempered Glass, 2x 120mm Fans' },
            { id: 'case2', name: 'NZXT H510', price: 89.99, image: '/placeholder.svg', specs: 'ATX Mid Tower, Tempered Glass, 2x 120mm Fans' },
            { id: 'case3', name: 'Corsair 4000D Airflow', price: 94.99, image: '/placeholder.svg', specs: 'ATX Mid Tower, Tempered Glass, 2x 120mm Fans' },
          ],
          cooler: [
            { id: 'cooler1', name: 'Noctua NH-D15', price: 99.99, image: '/placeholder.svg', specs: 'Air Cooler, Dual 140mm Fans, 165mm Height' },
            { id: 'cooler2', name: 'Corsair iCUE H100i', price: 139.99, image: '/placeholder.svg', specs: '240mm AIO, RGB, 2x 120mm Fans' },
            { id: 'cooler3', name: 'be quiet! Dark Rock Pro 4', price: 89.99, image: '/placeholder.svg', specs: 'Air Cooler, Dual Fans, 162.8mm Height' },
          ]
        };
        
        setComponents(mockComponents[category] || []);
        setLoading(false);
      } catch (error) {
        console.error(`Error fetching ${category} components:`, error);
        setLoading(false);
      }
    };
    
    fetchComponents();
  }, [category]);
  
  const handleSelect = (component) => {
    selectComponent(category, component);
    setIsOpen(false);
  };
  
  const handleRemove = () => {
    removeComponent(category);
  };
  
  const selectedComponent = selectedComponents[category];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        {selectedComponent ? (
          <button 
            onClick={handleRemove}
            className="text-red-600 dark:text-red-400 text-sm hover:underline focus:outline-none"
          >
            Remove
          </button>
        ) : null}
      </div>
      
      {selectedComponent ? (
        <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3 flex items-center">
          <div className="h-16 w-16 relative flex-shrink-0">
            <Image
              src={selectedComponent.image}
              alt={selectedComponent.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="ml-4 flex-grow">
            <h4 className="font-medium text-gray-900 dark:text-white">{selectedComponent.name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedComponent.specs}</p>
          </div>
          <div className="ml-4 text-right">
            <p className="font-bold text-gray-900 dark:text-white">${selectedComponent.price.toFixed(2)}</p>
            <button 
              onClick={() => setIsOpen(true)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Select {title}
        </button>
      )}
      
      {/* Component Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select {title}</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 max-h-[calc(80vh-4rem)]">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {components.map((component) => (
                    <div 
                      key={component.id}
                      onClick={() => handleSelect(component)}
                      className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3 flex items-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <div className="h-16 w-16 relative flex-shrink-0">
                        <Image
                          src={component.image}
                          alt={component.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className="font-medium text-gray-900 dark:text-white">{component.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{component.specs}</p>
                      </div>
                      <div className="ml-4">
                        <p className="font-bold text-gray-900 dark:text-white">${component.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}