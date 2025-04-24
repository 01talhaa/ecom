"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SpecialOffers() {
  // Optional: Add a subtle parallax effect on scroll
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <section className="py-24 overflow-hidden bg-gradient-to-b from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
      <div className="container mx-auto px-4 relative">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-200/20 dark:bg-blue-700/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-60 -right-60 w-96 h-96 bg-purple-200/20 dark:bg-purple-700/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-green-200/10 dark:bg-green-700/10 rounded-full blur-3xl"></div>
        </div>
        
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col items-center mb-16 relative z-10"
        >
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-sm font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase mb-2"
          >
            Limited Time Deals
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center leading-tight"
          >
            Special Offers
          </motion.h2>
          
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="h-1.5 w-24 mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
          ></motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 text-gray-600 dark:text-gray-300 max-w-2xl text-center text-lg"
          >
            Discover exclusive deals and premium collections crafted just for you.
            Limited time offers with exceptional value.
          </motion.p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12"
        >
          {/* Summer Sale Card */}
          <motion.div 
            variants={itemVariants}
            className="group"
            style={{ 
              perspective: "1000px",
            }}
          >
            <div 
              className="relative overflow-hidden rounded-3xl shadow-xl h-[450px] bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-indigo-900/30 border border-blue-100/50 dark:border-blue-700/30 transform transition-all duration-700 hover:shadow-2xl"
              style={{ 
                transform: `rotateY(${scrollY * 0.01}deg) rotateX(${scrollY * -0.01}deg)`,
                transformStyle: "preserve-3d" 
              }}
            >
              {/* Glass effect overlay */}
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 dark:bg-black/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
              
              {/* Content */}
              <div className="absolute inset-0 p-10 flex flex-col justify-center z-20">
                <div className="relative">
                  <span className="inline-flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-full mb-6 shadow-lg">
                    <span className="animate-pulse h-2 w-2 bg-white rounded-full"></span>
                    <span>Limited Time</span>
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-100 mb-4 group-hover:translate-x-1 transition-transform duration-500 pb-2 relative">
                  Summer Sale
                  <span className="absolute bottom-0 left-0 h-0.5 w-16 bg-blue-500 dark:bg-blue-400 rounded-full transform origin-left transition-all duration-700 group-hover:w-32"></span>
                </h3>
                
                <p className="text-blue-800/90 dark:text-blue-200 mb-8 text-lg max-w-sm leading-relaxed transform transition-all duration-700 group-hover:translate-y-[-2px]">
                  Get up to <span className="font-bold text-blue-700 dark:text-blue-300">50% off</span> on selected premium items. 
                  Refresh your style with seasonal favorites!
                </p>
                
                <Link 
                  href="/products?sale=true" 
                  className="inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 dark:from-blue-500 dark:via-blue-400 dark:to-indigo-500 text-white font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 dark:hover:shadow-blue-600/20 transform hover:-translate-y-1 w-max"
                >
                  <span>Shop Now</span>
                  <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              
              {/* Image */}
              <div className="absolute right-0 bottom-0 w-2/3 h-full overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 dark:from-blue-900/80 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,transparent_60%,rgba(59,130,246,0.3)_100%)] dark:bg-[radial-gradient(circle_at_bottom_right,transparent_60%,rgba(59,130,246,0.15)_100%)] z-5"></div>
                
                {/* Image with parallax effect */}
                <div className="absolute inset-0 transform transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1">
                  <Image 
                    src="/images/summer-sale.jpg" 
                    alt="Summer Sale Collection" 
                    fill 
                    quality={90}
                    priority
                    className="object-cover object-right-bottom"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Optional floating elements */}
                <div className="absolute bottom-8 right-8 h-16 w-16 rounded-full bg-blue-500/20 dark:bg-blue-500/10 backdrop-blur-md z-20 animate-float-slow"></div>
                <div className="absolute top-12 right-12 h-8 w-8 rounded-full bg-indigo-500/20 dark:bg-indigo-500/10 backdrop-blur-md z-20 animate-float"></div>
              </div>
              
              {/* Optional: Add a subtle shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 dark:via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none"></div>
            </div>
          </motion.div>

          {/* New Arrivals Card */}
          <motion.div 
            variants={itemVariants}
            className="group"
            style={{ 
              perspective: "1000px",
            }}
          >
            <div 
              className="relative overflow-hidden rounded-3xl shadow-xl h-[450px] bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 dark:from-emerald-900/30 dark:via-green-800/20 dark:to-teal-900/30 border border-green-100/50 dark:border-green-700/30 transform transition-all duration-700 hover:shadow-2xl"
              style={{ 
                transform: `rotateY(${scrollY * -0.01}deg) rotateX(${scrollY * -0.01}deg)`,
                transformStyle: "preserve-3d" 
              }}
            >
              {/* Glass effect overlay */}
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 dark:bg-black/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"></div>
              
              {/* Content */}
              <div className="absolute inset-0 p-10 flex flex-col justify-center z-20">
                <div className="relative">
                  <span className="inline-flex items-center space-x-1 bg-gradient-to-r from-green-600 to-teal-600 text-white text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-full mb-6 shadow-lg">
                    <span className="animate-ping h-1.5 w-1.5 bg-white rounded-full"></span>
                    <span>Just Launched</span>
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-green-900 dark:text-green-100 mb-4 group-hover:translate-x-1 transition-transform duration-500 pb-2 relative">
                  New Arrivals
                  <span className="absolute bottom-0 left-0 h-0.5 w-16 bg-green-500 dark:bg-green-400 rounded-full transform origin-left transition-all duration-700 group-hover:w-32"></span>
                </h3>
                
                <p className="text-green-800/90 dark:text-green-200 mb-8 text-lg max-w-sm leading-relaxed transform transition-all duration-700 group-hover:translate-y-[-2px]">
                  Discover our <span className="font-bold text-green-700 dark:text-green-300">latest collection</span> with cutting-edge designs and premium craftsmanship.
                </p>
                
                <Link 
                  href="/products?new=true" 
                  className="inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-green-600 via-green-500 to-teal-600 hover:from-green-700 hover:via-green-600 hover:to-teal-700 dark:from-green-500 dark:via-green-400 dark:to-teal-500 text-white font-medium rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 dark:hover:shadow-green-600/20 transform hover:-translate-y-1 w-max"
                >
                  <span>Explore Collection</span>
                  <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              
              {/* Image */}
              <div className="absolute right-0 bottom-0 w-2/3 h-full overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 dark:from-green-900/80 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,transparent_60%,rgba(34,197,94,0.3)_100%)] dark:bg-[radial-gradient(circle_at_bottom_right,transparent_60%,rgba(34,197,94,0.15)_100%)] z-5"></div>
                
                {/* Image with parallax effect */}
                <div className="absolute inset-0 transform transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1">
                  <Image 
                    src="/images/new-arrivals.jpg" 
                    alt="New Arrivals Collection" 
                    fill 
                    quality={90}
                    className="object-cover object-right-bottom" 
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Optional floating elements */}
                <div className="absolute bottom-12 right-12 h-20 w-20 rounded-full bg-green-500/20 dark:bg-green-500/10 backdrop-blur-md z-20 animate-float"></div>
                <div className="absolute top-10 right-16 h-10 w-10 rounded-full bg-teal-500/20 dark:bg-teal-500/10 backdrop-blur-md z-20 animate-float-slow"></div>
              </div>
              
              {/* Optional: Add a subtle shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 dark:via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none"></div>
            </div>
          </motion.div>
        </motion.div>

        {/* Add a "View All Offers" button at the bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-12 text-center relative z-10"
        >
          <Link
            href="/products/offers"
            className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span>View All Special Offers</span>
            <svg className="w-4 h-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}