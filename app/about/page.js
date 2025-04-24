import Image from "next/image"

export const metadata = {
  title: "About Us | NextShop",
  description: "Learn more about NextShop, our mission, values, and team.",
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">About NextShop</h1>

        <div className="relative w-full h-80 mb-8 rounded-lg overflow-hidden">
          <Image src="/placeholder.svg" alt="NextShop Team" fill className="object-cover" />
        </div>

        <div className="prose max-w-none">
          <h2>Our Story</h2>
          <p>
            Founded in 2023, NextShop began with a simple mission: to provide high-quality products at affordable prices
            with exceptional customer service. What started as a small online store has grown into a trusted e-commerce
            platform serving customers nationwide.
          </p>

          <h2>Our Mission</h2>
          <p>
            At NextShop, we're committed to making online shopping easy, enjoyable, and accessible to everyone. We
            believe in transparency, quality, and putting our customers first in everything we do.
          </p>

          <h2>Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Quality</h3>
              <p className="text-gray-700">
                We carefully select each product to ensure it meets our high standards of quality and durability.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-700 mb-2">Integrity</h3>
              <p className="text-gray-700">
                We operate with honesty and transparency in all our business practices and customer interactions.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-700 mb-2">Innovation</h3>
              <p className="text-gray-700">
                We continuously improve our platform and offerings to provide the best shopping experience.
              </p>
            </div>
          </div>

          <h2>Our Team</h2>
          <p>
            Our diverse team of professionals is passionate about e-commerce and dedicated to providing the best
            shopping experience. From our customer service representatives to our logistics experts, everyone at
            NextShop plays a crucial role in our success.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-4">
                <Image src="/placeholder.svg" alt="John Doe" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold">John Doe</h3>
              <p className="text-gray-600">CEO & Founder</p>
            </div>

            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-4">
                <Image src="/placeholder.svg" alt="Jane Smith" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold">Jane Smith</h3>
              <p className="text-gray-600">Chief Operations Officer</p>
            </div>

            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-4">
                <Image src="/placeholder.svg" alt="Robert Johnson" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-semibold">Robert Johnson</h3>
              <p className="text-gray-600">Head of Customer Service</p>
            </div>
          </div>

          <h2>Our Commitment to Sustainability</h2>
          <p>
            We're committed to reducing our environmental impact. From eco-friendly packaging to partnering with
            sustainable brands, we're taking steps to make our operations more environmentally responsible.
          </p>

          <h2>Join Our Journey</h2>
          <p>
            We're grateful for the trust our customers place in us, and we're excited to continue growing and improving.
            Thank you for being a part of our journey!
          </p>
        </div>
      </div>
    </div>
  )
}

