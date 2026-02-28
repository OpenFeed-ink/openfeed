"use client";

import { deleteProjectAction } from "@/actions/projects";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { RotateCcwIcon, Trash2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

export const DeleteProject = ({ id }: { id: string }) => {
  const [state, formAction] = useActionState(deleteProjectAction, EMPTY_FORM_STATE);

  useEffect(() => {
    if (state.status === "ERROR") {
      toast.error(state.message);
      return;
    }
    if (state.status === "SUCCESS") {
      toast.success(state.message)
      return;
    }
  }, [state]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the project and all associated feedback, roadmap items, and changelog entries.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>
          <form action={(data) => {
            data.set("id", id)
            formAction(data)
          }}>
            <AlertDialogAction
              asChild
            >
              <DeleteBtn />
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const DeleteBtn = () => {
  const { pending } = useFormStatus();

  return (<Button type="submit" variant="destructive" disabled={pending}>
    {pending ? <><RotateCcwIcon className="animate-spin" /> Deleting..</> : <><Trash2 /> Delete </>}
  </Button>)
}
