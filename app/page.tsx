import { CrostiHero } from "@/components/crosti-hero";
import { CookiesSection } from "@/components/cookies-section";
import { MonthlyCookiesSection } from "@/components/monthly-cookies-section";
import { AboutSection } from "@/components/about-section";
import { VisitSection } from "@/components/visit-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { NewsBanner } from "@/components/news-banner";

export default function Home() {
  return (
    <main>
      <NewsBanner />
      <div className="relative">
        {/* Garabato decorativo */}
        <svg
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 100,
  }}
  viewBox="0 0 1440 900"
  xmlns="http://www.w3.org/2000/svg"
  preserveAspectRatio="xMidYMid slice"
>
  <path
  d="
    M 660 -120
    C 560 20, 570 180, 688 210
    C 718 218, 738 198, 728 168
    C 718 138, 695 145, 690 172
    C 672 280, 850 300, 1040 240
    C 1220 190, 1380 260, 1420 380
    C 1460 500, 1440 600, 1400 650
    C 1370 685, 1400 720, 1440 680
  "
  fill="none"
  stroke="#930021"
  strokeWidth="16"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>

        <CrostiHero />
      </div>
      <CookiesSection />
      <MonthlyCookiesSection />
      <AboutSection />
      <VisitSection />
      <CTASection />
      <Footer />
    </main>
  );
}
