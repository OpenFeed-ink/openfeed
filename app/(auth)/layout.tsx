import { MarketingInfo } from "@/components/marketing-info";
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation'
import { headers } from "next/headers";



export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) redirect("/");

  return (
    <div className="relative z-10 flex w-full max-w-7xl flex-col lg:flex-row">
      {/* Form Side */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        {children}
      </div>

      {/* Marketing Side */}
      <div className="lg:flex lg:w-1/2">
        <MarketingInfo />
      </div>
    </div>
  );
}
