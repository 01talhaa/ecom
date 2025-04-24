"use client"

import { Suspense } from "react"
import Navbar from "./Navbar"

export default function NavbarWrapper() {
  return (
    <Suspense fallback={<div className="h-16 bg-white shadow-sm dark:bg-gray-900"></div>}>
      <Navbar />
    </Suspense>
  )
}

