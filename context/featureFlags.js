// lib/featureFlags.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';

export const FEATURES = {
  PC_BUILDER: 'pc-builder',
};

// Context for feature flags
const FeatureFlagsContext = createContext({});

export function FeatureFlagsProvider({ children }) {
  const [features, setFeatures] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch this from an API or config
    // For now, use local storage or hardcoded values
    const clientId = localStorage.getItem('clientId') || 'default';
    
    // This would be fetched from API in a real implementation
    const clientFeatures = {
      'default': {
        [FEATURES.PC_BUILDER]: true,
      },
      'client1': {
        [FEATURES.PC_BUILDER]: true,
      },
      'client2': {
        [FEATURES.PC_BUILDER]: false,
      }
    };
    
    setFeatures(clientFeatures[clientId] || { [FEATURES.PC_BUILDER]: false });
    setIsLoading(false);
  }, []);
  
  return (
    <FeatureFlagsContext.Provider value={{ features, isLoading }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlag(featureName) {
  const { features, isLoading } = useContext(FeatureFlagsContext);
  return {
    enabled: !!features[featureName],
    isLoading
  };
}