import { HeroSection } from '@/components/landing/sections/HeroSection'
import { FeaturesSection } from '@/components/landing/sections/FeaturesSection'
import { SectionWrapper } from '@/components/landing/sections/SectionWrapper'
import { InstallSection } from '@/components/landing/sections/InstallSection'
import { ComparisonTable } from '@/components/landing/sections/ComparisonTable'
import { HowItWorks } from '@/components/landing/sections/HowItWorks'
import { AIAdvisorSpotlight } from '@/components/landing/sections/AIAdvisorSpotlight'
import { PricingSection } from '@/components/landing/sections/PricingSection'
import { FAQSection } from '@/components/landing/sections/FAQSection'
import { FinalCTA } from '@/components/landing/sections/FinalCTA'
import { Footer } from '@/components/landing/sections/Footer'
import { redirect } from 'next/navigation'
import { getServerSession } from "@/lib/server/session";
import { MainNavBar } from '@/components/Navbar/mainNavbar'

export default async function Home() {
  const session = await getServerSession();
  if (session) redirect("/projects");

  return (<div className="flex flex-col w-full">
    <MainNavBar />
    <HeroSection />
    <SectionWrapper>
      <FeaturesSection />
    </SectionWrapper>
    <SectionWrapper bg="dark">
      <InstallSection />
    </SectionWrapper>
    <SectionWrapper>
      <ComparisonTable />
    </SectionWrapper>
    <SectionWrapper bg="light-gray">
      <HowItWorks />
    </SectionWrapper>
    <SectionWrapper bg="dark">
      <AIAdvisorSpotlight />
    </SectionWrapper>
    <SectionWrapper>
      <PricingSection />
    </SectionWrapper>
    <SectionWrapper>
      <FAQSection />
    </SectionWrapper>
    <SectionWrapper bg="dark">
      <FinalCTA />
    </SectionWrapper>
    <Footer />
  </div>)
}
