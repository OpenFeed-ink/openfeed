import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { redirect } from 'next/navigation'
import { databaseDrizzle } from "@/db";
import { getServerSession } from "@/lib/server/session";
import { ProjectPermissionProvider } from "@/contexts/ProjectPermissionProvider";
import { getAuthorizationWithProject } from "@/lib/billing/getAuthorization";
import { AuthorizationProvider } from "@/contexts/AuthorizationProvider";
import { getProjectPermission } from "@/lib/permission/getProjectPermission";

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>
}>) {
  const [{ id }, session] = await Promise.all([params, getServerSession()])

  if (!session?.user.id) return redirect("/signin")

  // These three don't depend on each other — run them together instead of
  // adding a full extra round trip to every dashboard navigation.
  const [userProjects, { permissions }, auth] = await Promise.all([
    databaseDrizzle.query.usersProjects.findMany({
      where: (up, ops) => ops.eq(up.userId, session.user.id),
      columns: {
        role: true,
      },
      with: {
        project: true
      }
    }),
    getProjectPermission(id),
    getAuthorizationWithProject(id),
  ])

  const selectedProject = userProjects.find(p => p.project.id === id)

  if (!selectedProject) redirect("/projects")


  return (
    <AuthorizationProvider value={auth}>
      <ProjectPermissionProvider memeberships={permissions} userId={session.user.id}>
        <SidebarProvider>
          <AppSidebar
            user={session.user}
            userProject={selectedProject}
            allProjects={userProjects}
          />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <DynamicBreadcrumb />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProjectPermissionProvider>
    </AuthorizationProvider>
  );
}
