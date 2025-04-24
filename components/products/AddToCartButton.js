"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"

export default function AddToCartButton({ product }) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product, quantity)
    // Show a success message or notification
    alert(`Added ${quantity} ${product.productName} to cart!`)
  }

  return (
    <div className="flex items-center">
      <div className="flex items-center border rounded-md mr-4">
        <button className="px-3 py-1 border-r" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
          -
        </button>
        <span className="px-3 py-1">{quantity}</span>
        <button className="px-3 py-1 border-l" onClick={() => setQuantity(quantity + 1)}>
          +
        </button>
      </div>

      <button onClick={handleAddToCart} className="btn-primary">
        Add to Cart
      </button>
    </div>
  )
}

