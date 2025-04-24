"use client"

import { useState } from "react"
import { usePCBuilder } from "@/context/PCBuilderContext"
import Image from "next/image"
import Link from "next/link"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export default function PCBuilderInterface() {
  const {
    components,
    products,
    selectedComponents,
    selectComponent,
    removeComponent,
    totalPrice,
    isConfigurationComplete,
    clearConfiguration,
    alreadyOwnedComponents,
    toggleAlreadyOwned
  } = usePCBuilder()

  const [isExporting, setIsExporting] = useState(false)

  // Predefined PC build recommendations
  const pcRecommendations = {
    gaming: {
      name: "Gaming PC",
      description: "High-performance components optimized for modern gaming",
      components: {
        CPU: products.CPU.find(c => c.id === 'cpu2'), // Intel Core i7
        MOTHERBOARD: products.MOTHERBOARD.find(c => c.id === 'mb2'), // MSI MPG Z690
        RAM: products.RAM.find(c => c.id === 'ram2'), // G.Skill Trident Z RGB 32GB
        STORAGE: products.STORAGE.find(c => c.id === 'storage2'), // WD Black SN850 1TB
        GPU: products.GPU.find(c => c.id === 'gpu1'), // NVIDIA RTX 3070
        PSU: products.PSU.find(c => c.id === 'psu2'), // Corsair RM850x
        CASE: products.CASE.find(c => c.id === 'case1'), // Fractal Design Meshify C
        COOLER: products.COOLER.find(c => c.id === 'cooler2'), // Corsair iCUE H100i
      },
      totalPrice: 2369.92,
    },
    office: {
      name: "Office Workstation",
      description: "Reliable components for productivity and office tasks",
      components: {
        CPU: products.CPU.find(c => c.id === 'cpu3'), // AMD Ryzen 5 5600X
        MOTHERBOARD: products.MOTHERBOARD.find(c => c.id === 'mb3'), // Gigabyte B660M DS3H
        RAM: products.RAM.find(c => c.id === 'ram3'), // Kingston FURY Beast 16GB
        STORAGE: products.STORAGE.find(c => c.id === 'storage3'), // Crucial MX500 2TB
        GPU: null, // No dedicated GPU needed
        PSU: products.PSU.find(c => c.id === 'psu3'), // Seasonic FOCUS GX-650
        CASE: products.CASE.find(c => c.id === 'case2'), // NZXT H510
        COOLER: null, // Stock cooler is sufficient
      },
      totalPrice: 774.94,
    },
    creator: {
      name: "Content Creator",
      description: "Powerful CPU and GPU for video editing and creative work",
      components: {
        CPU: products.CPU.find(c => c.id === 'cpu1'), // AMD Ryzen 7 5800X
        MOTHERBOARD: products.MOTHERBOARD.find(c => c.id === 'mb1'), // ASUS ROG Strix B550-F
        RAM: products.RAM.find(c => c.id === 'ram2'), // G.Skill Trident Z RGB 32GB
        STORAGE: products.STORAGE.find(c => c.id === 'storage3'), // Crucial MX500 2TB
        GPU: products.GPU.find(c => c.id === 'gpu2'), // AMD RX 6800 XT
        PSU: products.PSU.find(c => c.id === 'psu2'), // Corsair RM850x
        CASE: products.CASE.find(c => c.id === 'case3'), // Corsair 4000D Airflow
        COOLER: products.COOLER.find(c => c.id === 'cooler1'), // Noctua NH-D15
      },
      totalPrice: 2274.93,
    }
  }

  const generatePDF = async () => {
    setIsExporting(true)
    try {
      const element = document.getElementById("pc-build-summary")
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      })
      
      const imgData = canvas.toDataURL("image/png")
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height)
      pdf.save("my-pc-build.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
    setIsExporting(false)
  }

  // Check if a component is required after considering "already owned" status
  const isComponentRequired = (key, component) => {
    return component.required && !alreadyOwnedComponents.includes(key);
  }

  // Determine if the configuration is complete considering owned components
  const isEffectivelyComplete = () => {
    return Object.entries(components)
      .filter(([key, config]) => isComponentRequired(key, config))
      .every(([key]) => selectedComponents[key]);
  }

  // Apply a recommended build template
  const applyBuildTemplate = (template) => {
    // First clear the current configuration
    clearConfiguration();
    
    // Then apply each component from the template if it exists
    Object.entries(template.components).forEach(([key, component]) => {
      if (component) {
        selectComponent(key, component);
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-10 mt-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Custom PC Builder</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          Build your dream PC by selecting components that match your needs and budget
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Select Your Components
            </h2>
            <div className="space-y-4">
              {Object.entries(components).map(([key, component]) => (
                <div 
                  key={key}
                  className={`border rounded-lg p-4 flex flex-col transition-colors ${
                    isComponentRequired(key, component)
                      ? selectedComponents[key]
                        ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10'
                        : 'border-red-200 dark:border-red-900' 
                      : alreadyOwnedComponents.includes(key)
                        ? 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10'
                        : selectedComponents[key]
                          ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`mr-4 p-3 rounded-lg ${
                        selectedComponents[key]
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                          : alreadyOwnedComponents.includes(key)
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {getComponentIcon(key)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{component.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isComponentRequired(key, component) ? (
                            <span className="text-red-600 dark:text-red-400">Required</span>
                          ) : alreadyOwnedComponents.includes(key) ? (
                            <span className="text-amber-600 dark:text-amber-400">You already own this</span>
                          ) : 'Optional'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {selectedComponents[key] ? (
                        <div className="flex items-center">
                          <div className="mr-4 text-right">
                            <p className="font-medium text-gray-900 dark:text-white">{selectedComponents[key].name}</p>
                            <p className="text-green-600 dark:text-green-400">${selectedComponents[key].price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeComponent(key)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            aria-label="Remove component"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/pc-builder/select/${key.toLowerCase()}`}
                          className={`px-4 py-2 ${
                            alreadyOwnedComponents.includes(key) 
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          } rounded-md text-sm font-medium transition-colors flex items-center`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Select {component.name}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* "I already have this" checkbox */}
                  <div className="mt-3 pl-14">
                    <label className="inline-flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={alreadyOwnedComponents.includes(key)}
                        onChange={() => toggleAlreadyOwned(key)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        I already have this component
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              PC Build Recommendations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Not sure what to choose? Start with one of our expertly crafted PC builds designed for specific use cases.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Gaming PC Recommendation */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-purple-600 h-2"></div>
                <div className="p-5">
                  <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">{pcRecommendations.gaming.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pcRecommendations.gaming.description}
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">CPU:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{pcRecommendations.gaming.components.CPU.name.split(' ').slice(0, 3).join(' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">GPU:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{pcRecommendations.gaming.components.GPU.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">RAM:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{pcRecommendations.gaming.components.RAM.name.split(' ').slice(-1)[0]}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold">
                      ${pcRecommendations.gaming.totalPrice.toFixed(2)}
                    </div>
                    <button
                      onClick={() => applyBuildTemplate(pcRecommendations.gaming)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Apply Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Office Workstation Recommendation */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2"></div>
                <div className="p-5">
                  <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">{pcRecommendations.office.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pcRecommendations.office.description}
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">CPU:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{pcRecommendations.office.components.CPU.name.split(' ').slice(0, 3).join(' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Storage:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{pcRecommendations.office.components.STORAGE.name.split(' ').slice(-1)[0]}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">RAM:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{pcRecommendations.office.components.RAM.name.split(' ').slice(-1)[0]}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold">
                      ${pcRecommendations.office.totalPrice.toFixed(2)}
                    </div>
                    <button
                      onClick={() => applyBuildTemplate(pcRecommendations.office)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Apply Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Creator Recommendation */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-pink-500 h-2"></div>
                <div className="p-5">
                  <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">{pcRecommendations.creator.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pcRecommendations.creator.description}
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">CPU:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{pcRecommendations.creator.components.CPU.name.split(' ').slice(0, 3).join(' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">GPU:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{pcRecommendations.creator.components.GPU.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Storage:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{pcRecommendations.creator.components.STORAGE.name.split(' ').slice(-1)[0]}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold">
                      ${pcRecommendations.creator.totalPrice.toFixed(2)}
                    </div>
                    <button
                      onClick={() => applyBuildTemplate(pcRecommendations.creator)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Apply Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div id="pc-build-summary" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Build Summary</h2>
              <span className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full">
                {Object.keys(selectedComponents).length} selected
              </span>
            </div>
            
            {Object.keys(selectedComponents).length > 0 || alreadyOwnedComponents.length > 0 ? (
              <>
                <div className="space-y-4 mb-6">
                  {/* Selected components */}
                  {Object.entries(selectedComponents).map(([type, component]) => (
                    <div key={type} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 relative flex-shrink-0 mr-3">
                          <Image
                            src={component.image}
                            alt={component.name}
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{components[type].name}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{component.name}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">${component.price.toFixed(2)}</p>
                    </div>
                  ))}

                  {/* Already owned components */}
                  {alreadyOwnedComponents
                    .filter(type => !selectedComponents[type]) // Only show if not also selected
                    .map((type) => (
                      <div key={`owned-${type}`} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3 opacity-70">
                        <div className="flex items-center">
                          <div className="w-10 h-10 relative flex-shrink-0 mr-3 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 rounded">
                            {getComponentIcon(type)}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{components[type].name}</p>
                            <p className="font-medium text-amber-600 dark:text-amber-400">Already Owned</p>
                          </div>
                        </div>
                        <p className="font-semibold text-amber-600 dark:text-amber-400">$0.00</p>
                      </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-gray-600 dark:text-gray-400">Subtotal</p>
                    <p className="font-medium text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between mb-4">
                    <p className="text-gray-600 dark:text-gray-400">Estimated Tax</p>
                    <p className="font-medium text-gray-900 dark:text-white">${(totalPrice * 0.1).toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <p className="text-gray-900 dark:text-white">Total</p>
                    <p className="text-indigo-600 dark:text-indigo-400">${(totalPrice * 1.1).toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => clearConfiguration()}
                    className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
                  >
                    Clear Configuration
                  </button>
                  <button
                    onClick={generatePDF}
                    disabled={!isEffectivelyComplete() || isExporting}
                    className={`w-full py-2 px-4 bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-900 rounded-md text-indigo-700 dark:text-indigo-400 text-sm transition-colors flex items-center justify-center ${
                      isEffectivelyComplete() && !isExporting
                        ? "hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isExporting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download as PDF
                      </>
                    )}
                  </button>
                  <button
                    disabled={!isEffectivelyComplete()}
                    className={`w-full py-2 px-4 bg-indigo-600 rounded-md text-white text-sm transition-colors flex items-center justify-center ${
                      isEffectivelyComplete()
                        ? "hover:bg-indigo-700"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add PC to Cart
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-600 dark:text-gray-400 mb-1">Your build is empty</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  Start by selecting components or use one of our recommended builds
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Component icons for better visual representation
function getComponentIcon(type) {
  switch(type) {
    case 'CPU':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
    case 'MOTHERBOARD':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case 'RAM':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      );
    case 'STORAGE':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    case 'GPU':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    case 'PSU':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'CASE':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case 'COOLER':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      );
  }
}