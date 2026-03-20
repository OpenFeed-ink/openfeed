import { redirect } from 'next/navigation'
import { TooltipProvider } from "@/components/ui/tooltip";
import { getServerSession } from "@/lib/server/session";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session) redirect("/signin");

  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>

  );
}
