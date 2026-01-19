import type React from "react"
import type { Metadata } from "next"
import { Work_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
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
      {
        url: "/favicon-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon-32x32.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-touch-icon.png",
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
        {/* </CHANGE> */}
        <Analytics />
      </body>
    </html>
  )
}
