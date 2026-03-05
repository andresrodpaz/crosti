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

        {/* MacBook Air 13" (1280px) y Pro 14" (1512px) */}
        <svg
          className="hidden xl:block 2xl:hidden absolute inset-0 w-full h-full pointer-events-none z-[100]"
          viewBox="0 0 1280 800"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          stroke="#930021"
          fill="none"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M580 -100
               C490 20,500 165,610 193
               C638 200,656 182,647 155
               C638 128,617 134,613 158
               C597 255,730 258,875 197
               C998 147,1165 155,1228 220
               C1292 285,1300 395,1278 496
               C1261 572,1238 610,1280 598" />
        </svg>

        {/* MacBook Pro 16" (1728px+) */}
        <svg
          className="hidden 2xl:block absolute inset-0 w-full h-full pointer-events-none z-[100]"
          viewBox="0 0 1728 1000"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          stroke="#930021"
          fill="none"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M800 -130
               C690 20,700 200,830 232
               C868 242,892 218,880 184
               C868 152,840 160,836 190
               C817 300,990 318,1200 245
               C1380 183,1560 195,1630 278
               C1700 360,1710 500,1684 614
               C1665 698,1638 742,1728 728" />
        </svg>

        {/* lg (1024px-1279px) — pantallas intermedias */}
        <svg
          className="hidden lg:block xl:hidden absolute inset-0 w-full h-full pointer-events-none z-[100]"
          viewBox="0 0 1440 900"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          stroke="#930021"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M660 -120
               C560 20,570 180,688 210
               C718 218,738 198,728 168
               C718 138,695 145,690 172
               C672 280,820 280,980 215
               C1120 160,1310 170,1380 240
               C1450 310,1460 430,1435 540
               C1415 620,1390 660,1440 650" />
        </svg>

        {/* mobile (<640px) */}
        {/* <svg
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
        </svg> */}

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