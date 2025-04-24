import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/context/CartContext"
import { AuthProvider } from "@/context/AuthContext"
import { ThemeProvider } from "@/context/ThemeContext"
import NavbarWrapper from "@/components/layout/NavbarWrapper"
import Footer from "@/components/layout/Footer"
import { FeatureFlagsProvider } from "@/context/FeatureFlagsContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NextShop - E-commerce Platform",
  description: "A modern e-commerce platform built with Next.js",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <NavbarWrapper />
                <FeatureFlagsProvider>
                  <main className="flex-grow">{children}</main>
                </FeatureFlagsProvider>
                <Footer />
              </div>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'