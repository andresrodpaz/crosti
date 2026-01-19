import { CrostiHero } from "@/components/crosti-hero"
import { CookiesSection } from "@/components/cookies-section"
import { AboutSection } from "@/components/about-section"
import { VisitSection } from "@/components/visit-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { NewsBanner } from "@/components/news-banner"

export default function Home() {
  return (
    <main>
      <NewsBanner />
      <CrostiHero />
      <CookiesSection />
      <AboutSection />
      <VisitSection />
      <CTASection />
      <Footer />
    </main>
  )
}
