import { SectionWrapper } from '@/components/landing/sections/SectionWrapper'
import { PricingSection } from '@/components/landing/sections/PricingSection'
import { getServerSession } from '@/lib/server/session';
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/Navbar/Navbar';
import { AuthorizationProvider } from '@/contexts/AuthorizationProvider';
import { getAuthorizationWithUser } from '@/lib/billing/getAuthorization';
import { PaymentProvider } from '@/contexts/PaymentContext';


export default async function page() {
  const session = await getServerSession();

  if (!session) redirect("/signin");

  const auth = await getAuthorizationWithUser(session.user.id);

  return (
    <div className="flex flex-col w-full">
      <AuthorizationProvider value={auth}>
        <Navbar user={session.user} />
      </AuthorizationProvider>
      <SectionWrapper bg='light-gray'>
        <PaymentProvider>
          <PricingSection />
        </PaymentProvider>
      </SectionWrapper>
    </div>
  )
}
