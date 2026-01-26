"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type React from "react"
import { AuthProvider } from "./context/AuthContext"
import { AppProvider } from "./context/AppContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <AppProvider>{children}</AppProvider>
      </AuthProvider>
    </NextThemesProvider>
  )
}
