"use client"

import PCBuilderProvider from "@/context/PCBuilderContext"

export default function PCBuilderLayout({ children }) {
  return (
    <PCBuilderProvider>
      {children}
    </PCBuilderProvider>
  )
}