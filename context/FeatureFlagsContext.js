"use client"

import { createContext, useContext, useState, useEffect } from 'react';

// Features enum
export const FEATURES = {
  PC_BUILDER: 'pcBuilder',
  // other features you might want to toggle
};

// Default client config (could later fetch from API/database)
const clientFeatures = {
  'default': {
    [FEATURES.PC_BUILDER]: true,
  }
};

const FeatureFlagsContext = createContext({});

export function FeatureFlagsProvider({ children, clientId = 'default' }) {
  const [features, setFeatures] = useState({});
  
  useEffect(() => {
    const clientConfig = clientFeatures[clientId] || clientFeatures.default;
    setFeatures(clientConfig);
  }, [clientId]);
  
  return (
    <FeatureFlagsContext.Provider value={features}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlag(featureName) {
  const features = useContext(FeatureFlagsContext);
  return !!features[featureName];
}