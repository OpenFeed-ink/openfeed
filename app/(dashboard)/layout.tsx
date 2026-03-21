import { redirect } from 'next/navigation'
import { TooltipProvider } from "@/components/ui/tooltip";
import { getServerSession } from "@/lib/server/session";
import { AuthorizationProvider } from '@/contexts/AuthorizationProvider';
import { getAuthorization } from '@/lib/billing/getAuthorization';


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session) redirect("/signin");

  const auth = await getAuthorization(session.user.id);
  
  return (
    <TooltipProvider>
      <AuthorizationProvider value={auth}>
        {children}
      </AuthorizationProvider>
    </TooltipProvider>

  );
}
