"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Loader2, Plus } from "lucide-react"
import { Textarea } from "../ui/textarea"
import { useState, useTransition } from "react";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { upsertProjectAction } from "@/actions/projects";
import { toast } from "sonner";
import { useAuthorization } from "@/contexts/AuthorizationProvider";
import Link from "next/link"

type ProjectData = {
  id: string,
  name: string,
  description: string | null;
}

export const UpsertProject = ({ projectData, title = "New Project", userProjectCount }: { title?: string, projectData?: ProjectData, userProjectCount: number }) => {
  const [open, setOpen] = useState(false)
  const { requireFeature } = useAuthorization()
  const [pending, startTransition] = useTransition();
  const canCreateNewProject = requireFeature("project", userProjectCount)

  const handleSubmitProject = (data: FormData) => {
    if (!canCreateNewProject && !!projectData) return;
    if (projectData) data.set("id", projectData.id);
    startTransition(async () => {
      const state = await upsertProjectAction(EMPTY_FORM_STATE, data)
      if (state.status === "ERROR") {
        toast.error(state.message);
        return;
      }
      if (state.status === "SUCCESS" && !projectData) {
        setOpen(false)
        toast.success("project has been created")
        return;
      }
      if (state.status === 'SUCCESS' && projectData) {
        toast.success(`${projectData.name} has been updated.`)
        setOpen(false)
        return;
      }
    })
  }
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {projectData ? <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
        >
          <Edit className="h-4 w-4 text-muted-foreground hover:text-emerald-600" />
        </Button> :
          <Button size="lg" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            {title}
          </Button>}
      </DialogTrigger>

      <DialogContent className="min-w-md">
        <form
          action={handleSubmitProject}
        >
          <DialogHeader>
            <DialogTitle>
              {projectData ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              {projectData
                ? "Update your project details below."
                : "Create a new feedback board for your product or feature."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                minLength={3}
                maxLength={50}
                placeholder="My Awesome App"
                defaultValue={projectData?.name}
                disabled={pending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Project Description (help the AI understand your product)
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A brief description of your project"
                defaultValue={projectData?.description ?? undefined}
                disabled={pending}
                rows={4}
                minLength={5}
              />
            </div>
          </div>

          <DialogFooter>
            {canCreateNewProject || !!projectData ? <><DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>

              <Button disabled={pending} type="submit">
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {projectData ? "Updating..." : "Creating..."}
                  </>
                ) : projectData ? (
                  "Update Project"
                ) : (
                  "Create Project"
                )}
              </Button>
            </> : <div>
              <span>Limit reached for creating new feature.</span>
              <Button variant={'link'} asChild>
                <Link href={'/billing'}>
                  Upgrade your plan.
                </Link>
              </Button>
            </div>
            }
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
