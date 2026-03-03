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
        {/* decorative squiggle */}
        {/* desktop */}
        <svg
          className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-[100]"
          viewBox="0 0 1440 900"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          stroke="#9b001c"
          fill="none"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M660 -120
               C560 20,570 180,688 210
               C718 218,738 198,728 168
               C718 138,695 145,690 172
               C672 280,850 300,1040 240
               C1220 190,1380 260,1420 380
               C1460 500,1440 600,1400 650
               C1370 685,1400 720,1440 680" />
        </svg>

        {/* tablet
        <svg
          className="hidden sm:block lg:hidden absolute inset-0 w-full h-full pointer-events-none z-[100]"
          viewBox="0 0 1024 768"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          stroke="#9b001c"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M469.26 -85.33
               C398.22 14.22,405.22 128,488.5 149.3
               C510.0 154.9,525.0 140.7,517.7 119.5
               C510.0 98.1,494.3 103.0,490.0 122.3
               C477.0 199.1,604.4 213.3,739.0 170.7
               C867.0 135.1,981.8 184.9,1009.9 270.5
               C1038.0 355.6,1023.8 426.7,995.4 462.2
               C974.0 487.2,995.4 511.9,102.3 483.3" />
        </svg> */}

        {/* mobile */}
        <svg
          className="block sm:hidden absolute inset-0 w-full h-full pointer-events-none z-[100]"
          viewBox="0 0 390 844"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          stroke="#9b001c"
          fill="none"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M300 -50
               C280 0,290 80,320 100
               C330 110,345 95,340 80
               C335 65,320 70,318 85
               C315 200,350 220,380 240
               C410 260,410 380,380 420
               C360 450,380 500,390 560
               C392 580,380 600,370 620" />
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
