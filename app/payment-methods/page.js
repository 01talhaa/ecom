import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "Payment Methods | NextShop",
  description: "Learn about the various payment methods accepted at NextShop.",
}

export default function PaymentMethodsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Payment Methods</h1>

      <div className="max-w-4xl mx-auto">
        <p className="text-lg text-gray-600 mb-8 text-center">
          At NextShop, we offer a variety of secure payment methods to make your shopping experience convenient and
          safe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 relative mr-4">
                <Image src="/placeholder.svg" alt="bKash Logo" fill className="object-contain" />
              </div>
              <h2 className="text-2xl font-semibold">bKash</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Pay easily with bKash, Bangladesh's leading mobile financial service. Simply use your bKash account to
              make secure payments for your orders.
            </p>

            <h3 className="font-medium mb-2">How to pay with bKash:</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-1 mb-4">
              <li>Select bKash as your payment method during checkout</li>
              <li>Enter your bKash account number</li>
              <li>Confirm the payment on your bKash app or via USSD</li>
              <li>Once verified, your order will be processed</li>
            </ol>

            <p className="text-sm text-gray-500">Note: Standard bKash transaction fees may apply.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 relative mr-4">
                <Image src="/placeholder.svg" alt="Nagad Logo" fill className="object-contain" />
              </div>
              <h2 className="text-2xl font-semibold">Nagad</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Nagad offers a fast and secure way to pay for your purchases. Use your Nagad account to complete
              transactions quickly.
            </p>

            <h3 className="font-medium mb-2">How to pay with Nagad:</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-1 mb-4">
              <li>Choose Nagad as your payment option at checkout</li>
              <li>Enter your Nagad account number</li>
              <li>Verify the payment through the Nagad app or USSD</li>
              <li>Your order will be confirmed once payment is complete</li>
            </ol>

            <p className="text-sm text-gray-500">Note: Standard Nagad transaction fees may apply.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 relative mr-4">
                <Image src="/placeholder.svg" alt="SSLCommerz Logo" fill className="object-contain" />
              </div>
              <h2 className="text-2xl font-semibold">SSLCommerz</h2>
            </div>

            <p className="text-gray-600 mb-4">
              SSLCommerz provides multiple payment options including credit/debit cards, mobile banking, and internet
              banking from various banks in Bangladesh.
            </p>

            <h3 className="font-medium mb-2">Payment options through SSLCommerz:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
              <li>Visa, Mastercard, and American Express</li>
              <li>Internet Banking (multiple banks)</li>
              <li>Mobile Banking (bKash, Nagad, Rocket, etc.)</li>
            </ul>

            <p className="text-sm text-gray-500">All transactions are secured with industry-standard encryption.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 relative mr-4">
                <Image src="/placeholder.svg" alt="Cash on Delivery" fill className="object-contain" />
              </div>
              <h2 className="text-2xl font-semibold">Cash on Delivery</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Prefer to pay when you receive your order? Choose Cash on Delivery (COD) and pay in cash when your package
              arrives.
            </p>

            <h3 className="font-medium mb-2">How Cash on Delivery works:</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-1 mb-4">
              <li>Select Cash on Delivery during checkout</li>
              <li>We'll process and ship your order</li>
              <li>Pay in cash when your order is delivered</li>
              <li>Receive a receipt for your payment</li>
            </ol>

            <p className="text-sm text-gray-500">Note: COD may not be available for all products or locations.</p>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Secure Payments</h2>
          <p className="text-gray-700 mb-4">
            At NextShop, we take your payment security seriously. All transactions are processed through secure payment
            gateways with industry-standard encryption to protect your financial information.
          </p>
          <p className="text-gray-700">
            We never store your complete credit card information on our servers. Your payment details are securely
            handled by our trusted payment partners.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">Is it safe to use my credit card on your website?</h3>
              <p className="text-gray-600">
                Yes, all payment transactions are secured with SSL encryption. We use trusted payment gateways to
                process your payments securely.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg">When will my card be charged?</h3>
              <p className="text-gray-600">
                Your card will be charged immediately after you place your order and the payment is authorized.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg">Do you offer installment payment options?</h3>
              <p className="text-gray-600">
                Yes, we offer EMI options through select banks when you pay with credit cards via SSLCommerz. The
                available EMI options will be displayed during checkout.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg">What should I do if my payment fails?</h3>
              <p className="text-gray-600">
                If your payment fails, you can try again or choose a different payment method. If the issue persists,
                please contact our customer support team for assistance.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Have more questions about our payment methods?</p>
          <Link href="/contact" className="btn-primary inline-block">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}

