import { Check, ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from "./Logo"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { UserProject } from "@/type"

export function ProjectSwitcher({
  projects,
  selectedUserProject,
}: {
  projects: UserProject[],
  selectedUserProject: UserProject
}) {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-background"
              asChild
            >
              <Button
                variant="outline"
                className="py-7 flex items-center gap-3 w-full"
              >
                {/* Logo - never shrink */}
                <div className="shrink-0">
                  <Logo  />
                </div>

                {/* Text container */}
                <div className="flex flex-col leading-none min-w-0">
                  <span className="font-semibold text-xl dark:text-white text-black">
                    Open Feed
                  </span>

                  <div className="flex items-center gap-2 min-w-0">
                    {/* Project name - ONLY this truncates */}
                    <span
                      className="text-secondary-foreground truncate"
                      title={selectedUserProject.project.name}
                    >
                      {selectedUserProject.project.name}
                    </span>
                  </div>
                </div>

                {/* Icon - never shrink */}
                <ChevronsUpDown className="ml-auto shrink-0" />
              </Button>

            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            {projects.map(({ project }) => (
              <DropdownMenuItem
                key={project.id}
                asChild
              >
                <Link href={`/projects/${project.id}`}>
                  {project.name}{" "}
                  {project.id === selectedUserProject.project.id && <Check className="ml-auto" />}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
