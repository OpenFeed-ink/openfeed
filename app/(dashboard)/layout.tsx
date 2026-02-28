import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation'
import { headers } from "next/headers";
import { TooltipProvider } from "@/components/ui/tooltip";


export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/signin");

  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>

  );
}
