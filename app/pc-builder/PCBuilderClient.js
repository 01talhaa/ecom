// app/pc-builder/PCBuilderClient.js
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useFeatureFlag, FEATURES } from '@/lib/featureFlags';
import { PCBuilderProvider } from '@/context/PCBuilderContext';
import ComponentSelector from '@/components/pc-builder/ComponentSelector';
import BuildSummary from '@/components/pc-builder/BuildSummary';

export default function PCBuilderClient() {
  const router = useRouter();
  const { enabled, isLoading } = useFeatureFlag(FEATURES.PC_BUILDER);
  
  useEffect(() => {
    if (!isLoading && !enabled) {
      router.push('/');
    }
  }, [enabled, isLoading, router]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!enabled) {
    return null; // Will redirect
  }
  
  return (
    <PCBuilderProvider>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Custom PC Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Build your dream PC by selecting high-quality components. We'll help you ensure compatibility and optimal performance.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div id="pc-build-summary" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your PC Configuration</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select components for your build below. All components come with warranty and free shipping.
                </p>
                
                {/* Required Components */}
                <ComponentSelector category="cpu" title="Processor (CPU)" />
                <ComponentSelector category="motherboard" title="Motherboard" />
                <ComponentSelector category="ram" title="Memory (RAM)" />
                <ComponentSelector category="storage" title="Storage" />
                <ComponentSelector category="gpu" title="Graphics Card (GPU)" />
                <ComponentSelector category="psu" title="Power Supply (PSU)" />
                <ComponentSelector category="case" title="Computer Case" />
                <ComponentSelector category="cooler" title="CPU Cooler" />
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <BuildSummary />
          </div>
        </div>
      </div>
    </PCBuilderProvider>
  );
}