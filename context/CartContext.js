"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"

const CartContext = createContext()

// Simple UUID generator function as an alternative to the uuid package
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const { user, isAuthenticated } = useAuth() || {}

  // Initialize or retrieve sessionId from localStorage
  useEffect(() => {
    const initializeSessionId = () => {
      try {
        // Try to get existing sessionId from localStorage
        let existingSessionId = localStorage.getItem('cartSessionId')
        
        // If no sessionId exists, create a new one
        if (!existingSessionId) {
          existingSessionId = generateUUID()
          localStorage.setItem('cartSessionId', existingSessionId)
        }
        
        setSessionId(existingSessionId)
        console.log("Cart session ID:", existingSessionId)
      } catch (err) {
        console.error("Error initializing session ID:", err)
        // Fallback to memory-only session ID if localStorage fails
        setSessionId(generateUUID())
      }
    }

    initializeSessionId()
  }, [])

  // Fetch cart data when sessionId is available
  useEffect(() => {
    if (sessionId) {
      fetchCartItems()
    }
  }, [sessionId])

  // Fetch cart items from API
  const fetchCartItems = async () => {
    if (!sessionId) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching cart with session ID:", sessionId)

      // Make the request using only sessionId, no authentication
      const response = await fetch(`/api/proxy/api/v1/cart?_SessionId=${sessionId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const responseText = await response.text()
      console.log("Cart API Response Text:", responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Error parsing JSON response:", e)
        // If the API returns empty or invalid, use local cart
        const localCart = localStorage.getItem('localCart')
        if (localCart) {
          setCart(JSON.parse(localCart))
        }
        return
      }

      if (!response.ok) {
        console.warn(`API warning: ${response.status} - ${data.message || responseText}`)
        // If the API returns an error, fall back to local cart
        const localCart = localStorage.getItem('localCart')
        if (localCart) {
          setCart(JSON.parse(localCart))
        }
        return
      }

      if (data.success && data.data && data.data.cartView) {
        // Transform API data to our cart format based on the response structure
        const cartItems = data.data.cartView.cartItems?.map(item => ({
          id: `${item.productId}-${item.variantId}`, // Create a unique identifier
          productId: item.productId,
          variantId: item.variantId || 0,
          quantity: item.quantity,
          name: item.productName,
          price: item.unitPrice || 0, // Default to 0 if not provided
          thumbnail: item.thumbnail || '/placeholder-image.jpg',
          totalPrice: item.subtotal || 0
        })) || []

        setCart(cartItems)
        
        // Store in localStorage as backup
        localStorage.setItem('localCart', JSON.stringify(cartItems))
      } else {
        console.log("Empty cart or API returned no items")
        setCart([])
        localStorage.removeItem('localCart')
      }
    } catch (err) {
      console.error("Error fetching cart items:", err)
      setError(err.message || "Failed to load cart items")
      
      // Try to load from localStorage if API fails
      const localCart = localStorage.getItem('localCart')
      if (localCart) {
        try {
          setCart(JSON.parse(localCart))
        } catch (e) {
          setCart([])
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Add item to cart
  const addToCart = async (product, quantity, variantId = 0) => {
    if (!sessionId) return { success: false, message: "No session ID available" }
    
    setIsLoading(true)
    setError(null)

    try {
      // Create a simple payload with just sessionId and item details
      const payload = {
        sessionId: sessionId, // Try using sessionId instead of _SessionId
        userId: 0, // Use 0 as default for guest users
        items: [
          {
            productId: product.productId,
            variantId: variantId || 0,
            quantity: quantity
          }
        ]
      }

      console.log("Adding to cart with payload:", payload)

      const response = await fetch('/api/proxy/api/v1/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const responseText = await response.text()
      console.log("API Response (raw):", responseText)
      
      let data
      try {
        data = JSON.parse(responseText)
        console.log("API Response (parsed):", data)
      } catch (e) {
        console.error("Error parsing JSON response:", e)
        throw new Error("Invalid response from server")
      }

      if (!response.ok) {
        // If API fails, add to local cart
        console.warn(`API warning: ${response.status} - ${data.message || responseText}`)
        addToLocalCart(product, quantity, variantId)
        return { success: true, message: "Product added to local cart" }
      }

      if (data.success) {
        // Refresh cart after adding item
        fetchCartItems()
        return { success: true, message: data.message || "Product added to cart" }
      } else {
        // If API returns false success, add to local cart
        console.warn("API returned false success, using local cart")
        addToLocalCart(product, quantity, variantId)
        return { success: true, message: "Product added to local cart" }
      }
    } catch (err) {
      console.error("Error adding to cart:", err)
      setError(err.message || "Failed to add to cart")
      
      // Fall back to local cart
      addToLocalCart(product, quantity, variantId)
      return { success: true, message: "Product added to local cart" }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to add to local cart
  const addToLocalCart = (product, quantity, variantId = 0) => {
    const newItem = {
      id: `${product.productId}-${variantId}`,
      productId: product.productId,
      variantId: variantId || 0,
      quantity: quantity,
      name: product.productName || product.name,
      price: product.originalPrice || product.price,
      thumbnail: product.thumbnail || product.image,
      totalPrice: (product.originalPrice || product.price) * quantity
    }
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.productId === product.productId && item.variantId === variantId
      )
      
      let updatedCart;
      if (existingItemIndex >= 0) {
        // Update existing item
        updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity,
          totalPrice: updatedCart[existingItemIndex].price * (updatedCart[existingItemIndex].quantity + quantity)
        }
      } else {
        // Add new item
        updatedCart = [...prevCart, newItem]
      }
      
      // Update localStorage
      localStorage.setItem('localCart', JSON.stringify(updatedCart))
      return updatedCart
    })
  }

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    setIsLoading(true)
    setError(null)

    try {
      // Try API first
      const response = await fetch(`/api/proxy/api/v1/cart/DeleteChild${itemId}?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // If API fails, remove from local cart
      if (!response.ok) {
        removeFromLocalCart(itemId)
        return true
      }

      const data = await response.json()
      console.log("Remove from cart response:", data)

      if (data.success) {
        // Refresh cart after removing item
        fetchCartItems()
        return true
      } else {
        // Fall back to local cart
        removeFromLocalCart(itemId)
        return true
      }
    } catch (err) {
      console.error("Error removing from cart:", err)
      setError(err.message || "Failed to remove from cart")
      
      // Fall back to local cart
      removeFromLocalCart(itemId)
      return true
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to remove from local cart
  const removeFromLocalCart = (itemId) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.id !== itemId)
      localStorage.setItem('localCart', JSON.stringify(updatedCart))
      return updatedCart
    })
  }

  // Clear entire cart
  const clearCart = async () => {
    if (!sessionId) return false

    setIsLoading(true)
    setError(null)

    try {
      // Try API first
      const response = await fetch(`/api/proxy/api/v1/cart/${sessionId}?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // If API fails, clear local cart
      if (!response.ok) {
        clearLocalCart()
        return true
      }

      const data = await response.json()
      console.log("Clear cart response:", data)

      if (data.success) {
        clearLocalCart()
        return true
      } else {
        // Fall back to local cart
        clearLocalCart()
        return true
      }
    } catch (err) {
      console.error("Error clearing cart:", err)
      setError(err.message || "Failed to clear cart")
      
      // Fall back to local cart
      clearLocalCart()
      return true
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to clear local cart
  const clearLocalCart = () => {
    setCart([])
    localStorage.removeItem('localCart')
  }

  // Update cart item quantity
  const updateCartItemQuantity = async (itemId, quantity) => {
    // First find the item in the current cart
    const currentItem = cart.find(item => item.id === itemId)
    if (!currentItem) return false

    setIsLoading(true)
    setError(null)

    try {
      // Try to update via API by removing and adding
      const removeSuccess = await removeFromCart(itemId)
      if (!removeSuccess) {
        throw new Error("Failed to update item quantity")
      }

      const product = {
        productId: currentItem.productId,
        productName: currentItem.name,
        originalPrice: currentItem.price,
        thumbnail: currentItem.thumbnail
      }
      
      const addResult = await addToCart(product, quantity, currentItem.variantId)
      if (!addResult.success) {
        throw new Error(`Failed to update item: ${addResult.message}`)
      }

      return true
    } catch (err) {
      console.error("Error updating cart item:", err)
      setError(err.message || "Failed to update cart item")
      
      // Fall back to updating local cart
      updateLocalCartItemQuantity(itemId, quantity)
      return true
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to update quantity in local cart
  const updateLocalCartItemQuantity = (itemId, quantity) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: quantity, totalPrice: item.price * quantity }
          : item
      )
      localStorage.setItem('localCart', JSON.stringify(updatedCart))
      return updatedCart
    })
  }

  // Calculate cart totals
  const getCartTotals = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    
    // You can add additional calculations like tax, shipping, etc.
    const shipping = 0 // Free shipping for now
    const tax = subtotal * 0.1 // Example 10% tax
    const total = subtotal + shipping + tax
    
    return {
      subtotal,
      shipping,
      tax,
      total,
      itemCount: cart.reduce((count, item) => count + item.quantity, 0)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        error,
        sessionId,
        isAuthenticated,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItemQuantity,
        getCartTotals,
        fetchCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}