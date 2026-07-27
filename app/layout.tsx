import type React from "react"
import type { Metadata } from "next"
import { Work_Sans } from "next/font/google"
import { ErrorSuppressor } from "@/components/error-boundary"
import { Toaster } from "sonner"
import "./globals.css"

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" })

export const metadata: Metadata = {
  title: "Crosti Cookies | Galletas Artesanales en Barcelona",
  description:
    "Crosti Cookies ofrece galletas artesanales en Barcelona, horneadas a diario con ingredientes de alta calidad, sabores únicos y pedido online para Barcelona.",
  keywords: [
    "galletas artesanales Barcelona",
    "mejores galletas Barcelona",
    "cookies Barcelona",
    "pastelería Barcelona",
    "dulcería Barcelona",
    "cookies delivery Barcelona",
    "artisan cookies Barcelona",
    "best cookies Barcelona",
    "bakery Barcelona",
    "cookie shop Barcelona",
    "fresh baked cookies Barcelona",
  ],
  generator: "Crosti",
  metadataBase: new URL("https://crosti.es"),
  alternates: {
    canonical: "https://crosti.es",
  },
  openGraph: {
    title: "Crosti Cookies | Galletas Artesanales en Barcelona",
    description:
      "Galletas artesanales horneadas frescas a diario en Barcelona. Sabores de temporada, ingredientes premium y pedido online para Barcelona.",
    url: "https://crosti.es",
    siteName: "Crosti Cookies",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "https://crosti.es/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Galletas artesanales Crosti en Barcelona",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crosti Cookies | Horneadas en Barcelona, loved everywhere.",
    description: "Las mejores galletas artesanales de Barcelona, horneadas frescas a diario para disfrutar en casa o en eventos.",
    images: ["https://crosti.es/og-image.jpg"],
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Bakery",
              name: "Crosti Cookies",
              image: "https://crosti.es/og-image.jpg",
              url: "https://crosti.es",
              description:
                "Crosti es una pastelería artesanal en Barcelona especializada en galletas horneadas frescas a diario. Crosti is an artisan bakery in Barcelona specializing in fresh-baked cookies daily.",
              telephone: "+34931234567",
              email: "info@crosti.es",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Carrer de Llull 223",
                addressLocality: "Barcelona",
                addressRegion: "Cataluña",
                postalCode: "08005",
                addressCountry: "ES",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "41.40281286597616",
                longitude: "2.204235754413818",
              },
              servesCuisine: "Galletas artesanales",
              priceRange: "€€",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "11:00",
                  closes: "20:00",
                },
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "159",
                bestRating: "5",
              },
              sameAs: [
                "https://www.instagram.com/crosticookies/",
                "https://www.tiktok.com/@crosticookies",
                "https://www.facebook.com/p/Crosti-Cookies-61581835744529/",
              ],
            }),
          }}
        />
      </head>
      <body className={`${workSans.variable} font-sans antialiased`}>
        <ErrorSuppressor />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}