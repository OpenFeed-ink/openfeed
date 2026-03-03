import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation'
import { headers } from "next/headers";
import { databaseDrizzle } from "@/db";

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>
}>) {
  const projectId = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) return redirect("/signin")

  const projects = await databaseDrizzle.query.project.findMany({
    where: (p, ops) => ops.eq(p.userId, session.user.id),
  })
  const selectedProject = projects.find(p => p.id === projectId.id)

  if (!selectedProject) redirect("/projects")


  return (
    <SidebarProvider>
      <AppSidebar project={selectedProject} allProjects={projects} user={session.user} />
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
  );
}
