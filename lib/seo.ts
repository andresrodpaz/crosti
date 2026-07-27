export const siteConfig = {
  name: "Crosti Cookies",
  url: "https://crosti.es",
  locale: "es_ES",
  description:
    "Crosti Cookies ofrece galletas artesanales en Barcelona, horneadas a diario con ingredientes premium y servicio de pedido online.",
  phone: "+34 643 32 85 00",
  email: "info@crosti.es",
  address: {
    streetAddress: "Carrer de Llull 223",
    addressLocality: "Barcelona",
    addressRegion: "Cataluña",
    postalCode: "08005",
    addressCountry: "ES",
  },
  geo: {
    latitude: "41.40281286597616",
    longitude: "2.204235754413818",
  },
  openingHours: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "11:00",
      closes: "20:00",
    },
  ],
  social: {
    instagram: "https://www.instagram.com/crosticookies/",
    tiktok: "https://www.tiktok.com/@crosticookies",
    facebook: "https://www.facebook.com/p/Crosti-Cookies-61581835744529/",
  },
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildWebPageJsonLd({
  title,
  description,
  url,
  breadcrumbItems,
}: {
  title: string
  description: string
  url: string
  breadcrumbItems?: Array<{ name: string; url: string }>
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/images/crosti-logo-transparent.png`,
      sameAs: Object.values(siteConfig.social),
      contactPoint: {
        "@type": "ContactPoint",
        telephone: siteConfig.phone,
        contactType: "customer service",
        email: siteConfig.email,
      },
    },
  }

  if (breadcrumbItems?.length) {
    schema.breadcrumb = buildBreadcrumbJsonLd(breadcrumbItems)
  }

  return schema
}

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Bakery",
  name: siteConfig.name,
  image: `${siteConfig.url}/og-image.jpg`,
  url: siteConfig.url,
  description:
    "Crosti Cookies es una panadería artesanal en Barcelona especializada en galletas horneadas frescas y pedidos online para Barcelona.",
  telephone: siteConfig.phone,
  email: siteConfig.email,
  address: {
    "@type": "PostalAddress",
    ...siteConfig.address,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.geo.latitude,
    longitude: siteConfig.geo.longitude,
  },
  servesCuisine: "Galletas artesanales",
  priceRange: "€€",
  openingHoursSpecification: siteConfig.openingHours.map((hours) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: hours.dayOfWeek,
    opens: hours.opens,
    closes: hours.closes,
  })),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "159",
    bestRating: "5",
  },
  sameAs: Object.values(siteConfig.social),
}
