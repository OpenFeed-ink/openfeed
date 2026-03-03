
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
import { ProjectType } from "@/db/schema"


export function AppSidebar({ project, allProjects, user }: {
  project: ProjectType,
  allProjects: ProjectType[],
  user: {
    name: string;
    email: string;
    avatar?: string;
  }
}) {
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
        <ProjectSwitcher projects={allProjects} selectedProject={project} />
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
