import { MarketingInfo } from "@/components/marketing-info";
import { redirect } from 'next/navigation'
import { getServerSession } from "@/lib/server/session";



export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (session) redirect("/");

  return (
    <div className="flex w-full items-center justify-center max-w-[100em] flex-col lg:flex-row">
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
