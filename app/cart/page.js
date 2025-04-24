"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/context/CartContext"
import { Trash2, ShoppingBag, ArrowLeft, PlusCircle, MinusCircle } from "lucide-react"
import { toast } from "react-hot-toast"

export default function Cart() {
  const { cart, isLoading, error, removeFromCart, updateCartItemQuantity, getCartTotals, clearCart } = useCart()
  const [processingItems, setProcessingItems] = useState([])
  const router = useRouter()
  
  const { subtotal, shipping, tax, total, itemCount } = getCartTotals()

  // Handle quantity update
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return

    // Add item to processing state
    setProcessingItems(prev => [...prev, itemId])
    
    try {
      const success = await updateCartItemQuantity(itemId, newQuantity)
      
      if (!success) {
        toast.error("Failed to update quantity")
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast.error("Error updating quantity")
    } finally {
      // Remove item from processing state
      setProcessingItems(prev => prev.filter(id => id !== itemId))
    }
  }

  // Handle item removal
  const handleRemoveItem = async (itemId) => {
    // Add item to processing state
    setProcessingItems(prev => [...prev, itemId])
    
    try {
      const success = await removeFromCart(itemId)
      
      if (success) {
        toast.success("Item removed from cart")
      } else {
        toast.error("Failed to remove item")
      }
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Error removing item")
    } finally {
      // Remove item from processing state
      setProcessingItems(prev => prev.filter(id => id !== itemId))
    }
  }

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        const success = await clearCart()
        
        if (success) {
          toast.success("Cart cleared")
        } else {
          toast.error("Failed to clear cart")
        }
      } catch (error) {
        console.error("Error clearing cart:", error)
        toast.error("Error clearing cart")
      }
    }
  }

  // Handle checkout
  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
          <h2 className="text-red-800 dark:text-red-400 text-lg font-medium mb-2">Error Loading Cart</h2>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link 
            href="/products" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cart Items ({itemCount})
              </h2>
              <button 
                onClick={handleClearCart}
                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear Cart
              </button>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {cart.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row">
                  <div className="flex-shrink-0 sm:mr-6 mb-4 sm:mb-0">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={item.thumbnail || '/placeholder-image.jpg'}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between mb-2">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        <Link href={`/products/${item.productId}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                          {item.name}
                        </Link>
                      </h3>
                      
                      <div className="mt-1 sm:mt-0 text-base font-medium text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || processingItems.includes(item.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center text-sm">
                          {processingItems.includes(item.id) ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={processingItems.includes(item.id)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={processingItems.includes(item.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded"
                      >
                        {processingItems.includes(item.id) ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Link 
            href="/products" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Continue Shopping
          </Link>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax (estimated)</span>
                  <span className="text-gray-900 dark:text-white font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900 dark:text-white">Total</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md flex justify-center items-center transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                By proceeding, you agree to our Terms of Service and Privacy Policy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}