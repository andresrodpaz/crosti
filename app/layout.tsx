import type React from "react"
import type { Metadata } from "next"
import { Work_Sans } from "next/font/google"
import { ErrorSuppressor } from "@/components/error-boundary"
import { Toaster } from "sonner"
import "./globals.css"

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" })

export const metadata: Metadata = {
  title: "Crosti Cookies - Fresh Baked Cookies from Barcelona",
  description: "Galletas artesanales hechas con amor desde Barcelona",
  generator: "Crosti",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${workSans.variable} font-sans antialiased`}>
        <ErrorSuppressor />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
