// Utility functions to manage orders in localStorage

// Get all orders for the current user
export function getUserOrders(userId) {
  if (typeof window === "undefined") return []

  try {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "{}")
    return allOrders[userId] || []
  } catch (error) {
    console.error("Error getting orders from localStorage:", error)
    return []
  }
}

// Add a new order for the current user
export function addUserOrder(userId, order) {
  if (typeof window === "undefined") return

  try {
    const allOrders = JSON.parse(localStorage.getItem("orders") || "{}")

    if (!allOrders[userId]) {
      allOrders[userId] = []
    }

    allOrders[userId].unshift(order) // Add new order at the beginning

    localStorage.setItem("orders", JSON.stringify(allOrders))
    return true
  } catch (error) {
    console.error("Error adding order to localStorage:", error)
    return false
  }
}

