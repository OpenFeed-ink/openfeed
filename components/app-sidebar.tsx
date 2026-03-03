
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { LifeBuoyIcon, Lightbulb, Map, FileText, PaintRoller, Users, Brain } from "lucide-react"
import { ProjectSwitcher } from "./project-switcher"
import { UserProject } from "@/type"



export function AppSidebar({ userProject, allProjects, user }: {
  userProject: UserProject,
  allProjects: UserProject[],
  user: {
    name: string;
    email: string;
    avatar?: string;
  }
}) {
  const { project } = userProject
  const data = {
    navMain: [
      {
        title: "Feature Requests",
        url: `/projects/${project.id}/feature-requests`,
        icon: (
          <Lightbulb />
        ),
        isActive: true,
      },
      {
        title: "Roadmap",
        url: `/projects/${project.id}/roadmap`,
        icon: (
          <Map />
        ),
      },
      {
        title: "Changelog",
        url: `/projects/${project.id}/changelog`,
        icon: (
          <FileText />
        ),
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "/suuport",
        icon: (
          <LifeBuoyIcon
          />
        ),
      },
    ],
    projects: [
      {
        title: "Widget Builder",
        url: `/projects/${project.id}/widget-builder`,
        icon: (
          <PaintRoller
          />
        ),
      },
      {
        title: "Team",
        url: `/projects/${project.id}/team`,
        icon: (
          <Users />
        ),
      },
      {
        title: "AI Config",
        url: `/projects/${project.id}/ai`,
        icon: (
          <Brain />
        ),
      },
    ],
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <ProjectSwitcher projects={allProjects} selectedUserProject={userProject} />

        <span className="text-center text-xs text-primary capitalize">
          {userProject.role.toLowerCase()}
        </span>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} title="Collect Feedback" />
        <NavMain items={data.projects} title="Project" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
