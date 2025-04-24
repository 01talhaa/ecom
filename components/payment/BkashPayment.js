"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

export default function BkashPayment({ amount, phoneNumber, onComplete }) {
  const [step, setStep] = useState(1)
  const [pin, setPin] = useState("")
  const [otp, setOtp] = useState("")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  // Generate a random transaction ID
  const transactionId = "TRX" + Math.floor(100000000 + Math.random() * 900000000)

  const handleClose = useCallback(() => {
    onComplete(false)
  }, [onComplete])

  const handlePinSubmit = (e) => {
    e.preventDefault()
    setProcessing(true)
    setError("")

    // Simulate PIN verification
    setTimeout(() => {
      setProcessing(false)
      if (pin.length !== 4) {
        setError("Invalid PIN. Please enter a 4-digit PIN.")
      } else {
        setStep(2)
      }
    }, 1500)
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault()
    setProcessing(true)
    setError("")

    // Simulate OTP verification
    setTimeout(() => {
      setProcessing(false)
      if (otp.length !== 6) {
        setError("Invalid OTP. Please enter the 6-digit code.")
      } else {
        setStep(3)
        // Simulate payment completion after 2 seconds
        setTimeout(() => {
          onComplete(true)
        }, 2000)
      }
    }, 1500)
  }

  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [handleClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-pink-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 relative mr-2">
              <Image src="/placeholder.svg" alt="bKash Logo" fill className="object-contain" />
            </div>
            <h2 className="text-lg font-semibold">bKash Payment</h2>
          </div>
          <button onClick={handleClose} className="text-white hover:text-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-700 mb-2">Payment to: NextShop</p>
                <p className="text-gray-700 mb-2">Amount: ৳{amount.toFixed(2)}</p>
                <p className="text-gray-700 mb-2">From: {phoneNumber}</p>
                <p className="text-gray-500 text-sm">Transaction ID: {transactionId}</p>
              </div>

              <form onSubmit={handlePinSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    className="form-input"
                    placeholder="Enter your 4-digit bKash PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                    required
                  />
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Confirm Payment"}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <p className="text-gray-700 mb-2">Payment to: NextShop</p>
                <p className="text-gray-700 mb-2">Amount: ৳{amount.toFixed(2)}</p>
                <p className="text-gray-700 mb-2">From: {phoneNumber}</p>
                <p className="text-gray-500 text-sm">Transaction ID: {transactionId}</p>
              </div>

              <form onSubmit={handleOtpSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-input"
                    placeholder="Enter the 6-digit OTP sent to your phone"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">A 6-digit verification code has been sent to your phone</p>
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {processing ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your payment of ৳{amount.toFixed(2)} has been processed successfully.
              </p>
              <p className="text-gray-500 text-sm mb-6">Transaction ID: {transactionId}</p>
              <p className="text-gray-500 text-sm">Redirecting to order confirmation...</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
          <div className="text-xs text-gray-500">Powered by bKash Payment Gateway</div>
          <div className="text-xs text-gray-500">Need help? Call 16247</div>
        </div>
      </div>
    </div>
  )
}

