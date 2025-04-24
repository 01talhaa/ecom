"use client"

import { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage on client side
  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      try {
        // Check both token and user data
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
          // Check if token is expired
          const decodedToken = parseToken(token);
          const currentTime = Date.now() / 1000;
          
          // If token is still valid (not expired)
          if (decodedToken.exp && decodedToken.exp > currentTime) {
            // Parse user data and restore session
            const parsedUserData = JSON.parse(userData);
            setUser(parsedUserData);
            setIsAuthenticated(true);
          } else {
            // Token expired, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
          }
        }
      } catch (error) {
        console.error("Failed to load user from local storage:", error);
        // Clear potentially corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };
    
    // Run on mount
    loadUserFromLocalStorage();
  }, []);

  // Combined login function that handles both credential-based and token-based login
  const login = async (emailOrUserData, password, userType = "customer") => {
    try {
      // Check if this is a direct login with userData object (from OAuth or external login)
      if (typeof emailOrUserData === 'object' && emailOrUserData !== null) {
        const userData = emailOrUserData;
        
        if (userData.token) {
          // Store token
          localStorage.setItem('authToken', userData.token);
          
          // Store complete user object including token
          localStorage.setItem('userData', JSON.stringify(userData.user));
          
          // Update state
          setUser(userData.user);
          setIsAuthenticated(true);
          
          return { success: true };
        }
        return { success: false, message: "Invalid user data" };
      }
      
      // Otherwise, handle regular email/password login
      const email = emailOrUserData;
      
      // Determine which API endpoint to use based on userType
      let endpoint;
      let requestPayload;

      switch(userType) {
        case "vendor":
          endpoint = "/api/proxy/api/v1/auth/vendor-login";
          requestPayload = { email, password };
          break;
        case "admin":
          endpoint = "/api/proxy/api/v1/auth/login";
          // Admin login uses direct payload format (not model wrapped)
          requestPayload = { email, password };
          break;
        case "customer":
        default:
          endpoint = "/api/proxy/api/v1/auth/customer_login";
          requestPayload = { email, password };
      }
      
      // Call our API route
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload)
      });
      
      const data = await response.json();
      console.log(`${userType} login response:`, data);
      
      if (data.success && data.data && data.data.token) {
        // Extract user info from token
        const token = data.data.token;
        const userInfo = parseToken(token);
        
        // Store token and user data
        localStorage.setItem("authToken", token);
        
        // Create user object with info from token and response
        const userData = {
          email,
          name: data.data.customerName || data.data.name || email.split('@')[0],
          id: data.data.id || userInfo.sid || userInfo.sub,
          isAdmin: userType === "admin" && (userInfo.isAdmin === "true"),
          isVendor: userType === "vendor",
          userType: userType,
          avatar: data.data.profilePicture || null,
          mobile: data.data.mobile || null,
          token
        };
        
        // Store user data
        localStorage.setItem("userData", JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data.message || "Login failed" 
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: `An error occurred: ${error.message}` 
      };
    }
  }

  // Logout function
  const logout = async () => {
    try {
      // Remove tokens from storage
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      
      // Clear user data
      setUser(null);
      
      // Set isAuthenticated to false
      setIsAuthenticated(false);
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  // Helper to extract info from JWT token
  const parseToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      
      // Handle browser vs Node.js environments
      let jsonPayload;
      if (typeof window !== 'undefined') {
        // Browser
        jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
      } else {
        // Node.js (for SSR)
        const buffer = Buffer.from(base64, 'base64');
        jsonPayload = buffer.toString('utf-8');
      }

      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Error parsing token:", err);
      return {};
    }
  }

  // Check if token is expired
  const isTokenExpired = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return true;
    
    try {
      const decoded = parseToken(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp < currentTime;
    } catch (err) {
      console.error("Error checking token expiry:", err);
      return true;
    }
  }

  // Get the auth token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  }

  // Check if user is admin
  const isAdmin = () => {
    if (!user) return false;
    return user.isAdmin === true || user.userType === 'admin';
  }

  // Check if user is customer
  const isCustomer = () => {
    if (!user) return false;
    return user.userType === 'customer';
  }

  // Check if user is vendor
  const isVendor = () => {
    if (!user) return false;
    return user.isVendor === true || user.userType === 'vendor';
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        isTokenExpired,
        getAuthToken,
        isAdmin,
        isCustomer,
        isVendor
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}