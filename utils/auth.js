/**
 * Refreshes the authentication token
 * @returns {Promise<string|null>} The new token or null if refresh fails
 */
export const refreshAuthToken = async () => {
  try {
    // Get the refresh token from localStorage or wherever it's stored
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      console.error('No refresh token available');
      return null;
    }
    
    // Call your refresh token endpoint
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    
    // Store the new token
    localStorage.setItem('authToken', data.token);
    
    return data.token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};