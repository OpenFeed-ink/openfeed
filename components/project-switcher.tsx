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

type Project = {
  id: string,
  name: string,
}

export function ProjectSwitcher({
  projects,
  selectedProject,
}: {
  projects: Project[]
  selectedProject: Project
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
              <Button variant={'outline'} className="py-7">
                <Logo />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-xl dark:text-white text-black">Open Feed</span>
                  <span className="text-secondary-foreground">{selectedProject.name}</span>
                </div>
                <ChevronsUpDown className="ml-auto text-white" />
              </Button>

            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                asChild
              >
                <Link href={`/projects/${project.id}`}>
                  {project.name}{" "}
                  {project.id === selectedProject.id && <Check className="ml-auto" />}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
