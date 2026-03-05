"use client";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { HexColorPicker } from "react-colorful";
import { tag } from "@/db/schema"
import { toast } from "sonner";
import { upsertTagAction } from "@/actions/tags";

export const AddNewTag = ({ projectId, currentTag, title= "New tag" }: { 
  projectId: string, 
  currentTag?: typeof tag.$inferSelect,
  title?:string
}) => {
  const [newTag, setNewTag] = useState({
    name: currentTag?.name ?? "",
    color: currentTag?.color ?? "#14b8a6",
  })

  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const createTag = () => {
    const data = new FormData()
    data.set("projectId", projectId)
    data.set("name", newTag.name)
    data.set("color", newTag.color)
    currentTag && data.set("id", currentTag.id)
    startTransition(async () => {
      const result = await upsertTagAction(EMPTY_FORM_STATE, data)
      if (result.status === 'ERROR') {
        toast.error(result.message)
        return;
      }
      if (result.status === 'SUCCESS') {
        toast.success(result.message)
        setOpen(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 border-dashed"
        >
          <Plus className="h-3 w-3" />
          {currentTag ? "Update tag" : title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create new Tag</DialogTitle>
        </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tag name"
              className="flex-1"
              name="name"
              required
              min={1}
              max={255}
              disabled={pending}
              onChange={(e) => setNewTag(prv => ({ ...prv, name: e.target.value }))}
              autoFocus
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button disabled={pending} variant="outline" size="icon" className="h-9 w-9 p-0">
                  <div className="h-5 w-5 rounded-full" style={{ backgroundColor: newTag.color }} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <HexColorPicker color={newTag.color} onChange={(color) => setNewTag(prv => ({ ...prv, color }))} />
              </PopoverContent>
            </Popover>
          </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button
            disabled={pending}
            onClick={createTag}
            type="submit"
            className="bg-teal-600 hover:bg-teal-700"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {currentTag ? "Updating..." : "Creating..."}
              </>
            ) : currentTag ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}
