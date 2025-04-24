"use client"

import { createContext, useContext, useState, useEffect } from 'react';

// Define component categories
const PC_COMPONENTS = {
  CPU: {
    name: 'CPU',
    required: true,
  },
  MOTHERBOARD: {
    name: 'Motherboard',
    required: true,
  },
  RAM: {
    name: 'RAM',
    required: true,
  },
  STORAGE: {
    name: 'Storage',
    required: true,
  },
  GPU: {
    name: 'Graphics Card',
    required: false,
  },
  PSU: {
    name: 'Power Supply',
    required: true,
  },
  CASE: {
    name: 'PC Case',
    required: true,
  },
  COOLER: {
    name: 'CPU Cooler',
    required: false,
  },
};

// Define sample products
const PC_PRODUCTS = {
  CPU: [
    { id: 'cpu1', name: 'AMD Ryzen 7 5800X', price: 349.99, image: '/placeholder.svg', specs: '8 Cores, 16 Threads, 3.8GHz Base, 4.7GHz Boost' },
    { id: 'cpu2', name: 'Intel Core i7-12700K', price: 389.99, image: '/placeholder.svg', specs: '12 Cores, 20 Threads, 3.6GHz Base, 5.0GHz Boost' },
    { id: 'cpu3', name: 'AMD Ryzen 5 5600X', price: 229.99, image: '/placeholder.svg', specs: '6 Cores, 12 Threads, 3.7GHz Base, 4.6GHz Boost' },
  ],
  MOTHERBOARD: [
    { id: 'mb1', name: 'ASUS ROG Strix B550-F', price: 179.99, image: '/placeholder.svg', specs: 'ATX, AMD B550, PCIe 4.0, DDR4' },
    { id: 'mb2', name: 'MSI MPG Z690 Edge', price: 289.99, image: '/placeholder.svg', specs: 'ATX, Intel Z690, PCIe 5.0, DDR5' },
    { id: 'mb3', name: 'Gigabyte B660M DS3H', price: 129.99, image: '/placeholder.svg', specs: 'Micro-ATX, Intel B660, PCIe 4.0, DDR4' },
  ],
  RAM: [
    { id: 'ram1', name: 'Corsair Vengeance LPX 16GB', price: 79.99, image: '/placeholder.svg', specs: '2x8GB, DDR4-3600, CL18' },
    { id: 'ram2', name: 'G.Skill Trident Z RGB 32GB', price: 169.99, image: '/placeholder.svg', specs: '2x16GB, DDR4-3600, CL16' },
    { id: 'ram3', name: 'Kingston FURY Beast 16GB', price: 89.99, image: '/placeholder.svg', specs: '2x8GB, DDR4-3200, CL16' },
  ],
  STORAGE: [
    { id: 'storage1', name: 'Samsung 970 EVO Plus 1TB', price: 119.99, image: '/placeholder.svg', specs: 'NVMe M.2, 3500MB/s Read, 3300MB/s Write' },
    { id: 'storage2', name: 'WD Black SN850 1TB', price: 149.99, image: '/placeholder.svg', specs: 'NVMe M.2, 7000MB/s Read, 5300MB/s Write' },
    { id: 'storage3', name: 'Crucial MX500 2TB', price: 169.99, image: '/placeholder.svg', specs: 'SATA SSD, 560MB/s Read, 510MB/s Write' },
  ],
  GPU: [
    { id: 'gpu1', name: 'NVIDIA RTX 3070', price: 599.99, image: '/placeholder.svg', specs: '8GB GDDR6, 1.73GHz, 5888 CUDA Cores' },
    { id: 'gpu2', name: 'AMD RX 6800 XT', price: 649.99, image: '/placeholder.svg', specs: '16GB GDDR6, 2.25GHz, 4608 Stream Processors' },
    { id: 'gpu3', name: 'NVIDIA RTX 3060', price: 379.99, image: '/placeholder.svg', specs: '12GB GDDR6, 1.78GHz, 3584 CUDA Cores' },
  ],
  PSU: [
    { id: 'psu1', name: 'EVGA SuperNOVA 750 G5', price: 109.99, image: '/placeholder.svg', specs: '750W, Fully Modular, 80+ Gold' },
    { id: 'psu2', name: 'Corsair RM850x', price: 139.99, image: '/placeholder.svg', specs: '850W, Fully Modular, 80+ Gold' },
    { id: 'psu3', name: 'Seasonic FOCUS GX-650', price: 89.99, image: '/placeholder.svg', specs: '650W, Fully Modular, 80+ Gold' },
  ],
  CASE: [
    { id: 'case1', name: 'Fractal Design Meshify C', price: 99.99, image: '/placeholder.svg', specs: 'ATX Mid Tower, Tempered Glass, 2x 120mm Fans' },
    { id: 'case2', name: 'NZXT H510', price: 89.99, image: '/placeholder.svg', specs: 'ATX Mid Tower, Tempered Glass, 2x 120mm Fans' },
    { id: 'case3', name: 'Corsair 4000D Airflow', price: 94.99, image: '/placeholder.svg', specs: 'ATX Mid Tower, Tempered Glass, 2x 120mm Fans' },
  ],
  COOLER: [
    { id: 'cooler1', name: 'Noctua NH-D15', price: 99.99, image: '/placeholder.svg', specs: 'Air Cooler, Dual 140mm Fans, 165mm Height' },
    { id: 'cooler2', name: 'Corsair iCUE H100i', price: 139.99, image: '/placeholder.svg', specs: '240mm AIO, RGB, 2x 120mm Fans' },
    { id: 'cooler3', name: 'be quiet! Dark Rock Pro 4', price: 89.99, image: '/placeholder.svg', specs: 'Air Cooler, Dual Fans, 162.8mm Height' },
  ],
};

const PCBuilderContext = createContext();

export default function PCBuilderProvider({ children }) {
  const [selectedComponents, setSelectedComponents] = useState({});
  const [alreadyOwnedComponents, setAlreadyOwnedComponents] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const selectComponent = (type, component) => {
    setSelectedComponents(prev => ({
      ...prev,
      [type]: component
    }));
  };
  
  const removeComponent = (type) => {
    setSelectedComponents(prev => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };
  
  // Toggle whether a component is already owned
  const toggleAlreadyOwned = (type) => {
    setAlreadyOwnedComponents(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };
  
  const calculateTotalPrice = () => {
    return Object.values(selectedComponents).reduce(
      (sum, component) => sum + component.price,
      0
    );
  };
  
  // Check if required components are either selected or marked as already owned
  const isConfigurationComplete = () => {
    return Object.entries(PC_COMPONENTS)
      .filter(([key, config]) => config.required && !alreadyOwnedComponents.includes(key))
      .every(([key]) => selectedComponents[key]);
  };
  
  const clearConfiguration = () => {
    setSelectedComponents({});
    setAlreadyOwnedComponents([]);
  };
  
  useEffect(() => {
    const newTotal = calculateTotalPrice();
    setTotalPrice(newTotal);
  }, [selectedComponents]);
  
  return (
    <PCBuilderContext.Provider
      value={{
        components: PC_COMPONENTS,
        products: PC_PRODUCTS,
        selectedComponents,
        selectComponent,
        removeComponent,
        alreadyOwnedComponents,
        toggleAlreadyOwned,
        totalPrice,
        isConfigurationComplete,
        clearConfiguration,
      }}
    >
      {children}
    </PCBuilderContext.Provider>
  );
}

export function usePCBuilder() {
  const context = useContext(PCBuilderContext);
  
  if (!context) {
    throw new Error('usePCBuilder must be used within a PCBuilderProvider');
  }
  
  return context;
}