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
import { UserProject } from "@/type";

export default async function ProjectLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>
}>) {
  const {id} = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) return redirect("/signin")

  const userProjects:UserProject[] = await databaseDrizzle.query.usersProjects.findMany({
    where: (up, ops) => ops.eq(up.userId, session.user.id),
    columns:{
      role:true,
    },
    with:{
      project:true
    }
  })


  const selectedProject = userProjects.find(p => p.project.id === id)

  if (!selectedProject) redirect("/projects")


  return (
    <SidebarProvider>
     <AppSidebar user={session.user} userProject={selectedProject} allProjects={userProjects} />
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
