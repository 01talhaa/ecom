"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

export default function HeroBanner() {
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl my-8 shadow-2xl">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz1Nh_RXheOCyheOnK_B2obTcc_mLfgGso0w&s"
          alt="Summer collection background"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-transparent"></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 py-20 px-6 sm:px-12 lg:px-16 min-h-[500px] flex items-center">
        <div className={`max-w-xl transition-all duration-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Badge */}
          <div className="inline-block px-4 py-2 bg-white/15 backdrop-blur-md rounded-full mb-6 text-sm font-semibold text-white uppercase tracking-wider border border-white/20">
            Limited Time Offer
          </div>
          
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            <span className="block">Summer</span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
              Collection 2025
            </span>
          </h1>
          
          {/* Description */}
          <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-lg leading-relaxed">
            Discover our new summer collection with premium designs and 
            <span className="inline-flex items-center px-2 py-0.5 mx-1 rounded bg-yellow-500/20 text-yellow-300 font-semibold">
              up to 50% off
            </span>
            on selected items.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-white text-blue-800 font-bold py-3.5 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all group"
            >
              Shop Now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            
            <Link
              href="/categories"
              className="inline-flex items-center justify-center text-white border-2 border-white/50 font-bold py-3.5 px-8 rounded-lg hover:bg-white/10 transition-colors"
            >
              View Categories
            </Link>
          </div>
          
          {/* Features list */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { text: "Free Shipping", icon: "truck" },
              { text: "24/7 Support", icon: "headset" },
              { text: "Easy Returns", icon: "refresh" }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-2 text-white text-sm ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${(index + 1) * 200}ms`, transition: "opacity 0.5s ease-in-out" }}
              >
                {feature.icon === "truck" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                )}
                {feature.icon === "headset" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
                {feature.icon === "refresh" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 w-64 h-64 bg-yellow-300 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute top-20 right-20 w-24 h-24 border-4 border-white/20 rounded-xl transform rotate-12"></div>
      <div className="absolute bottom-20 left-40 w-10 h-10 bg-blue-300 rounded-full blur-sm opacity-40"></div>
    </div>
  )
}