import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthorizationProvider } from '@/contexts/AuthorizationProvider';
import { ProjectPermissionProvider } from "@/contexts/ProjectPermissionProvider";
import { getAuthorizationWithProject } from "@/lib/billing/getAuthorization";
import { getProjectPermission } from "@/lib/permission/getProjectPermission";
import { cookies } from "next/headers";


export default async function RootLayout({
  params,
  children,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ projectId: string }>
}>) {
  const { projectId } = await params
  const [auth, cookieStore] = await Promise.all([getAuthorizationWithProject(projectId), cookies()])
  const userId = cookieStore.get("visitor_token")?.value ?? ""
  const { permissions } = await getProjectPermission(projectId)

  return (
    <TooltipProvider>
      <AuthorizationProvider value={auth}>
        <ProjectPermissionProvider memeberships={permissions} userId={userId}>
          {children}
        </ProjectPermissionProvider>
      </AuthorizationProvider>
    </TooltipProvider>
  );
}
