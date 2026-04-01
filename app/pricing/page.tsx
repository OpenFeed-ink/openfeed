import { SectionWrapper } from '@/components/landing/sections/SectionWrapper'
import { PricingSection } from '@/components/landing/sections/PricingSection'
import { MainNavBar } from '@/components/Navbar/mainNavbar'


export default function page() {
  return (
    <div className="flex flex-col w-full">
    <MainNavBar />
    <SectionWrapper bg='light-gray'>
      <PricingSection />
    </SectionWrapper>
    </div>
  )
}
