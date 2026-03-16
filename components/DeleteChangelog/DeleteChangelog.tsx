"use client";

import { deleteChangeLogAction } from "@/actions/changelog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { RotateCcwIcon, Trash2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

export const DeleteChangelog = ({ id, projectId,open, onOpenAction }: { id: string,projectId:string, open: boolean, onOpenAction: (open:boolean)=> void }) => {
  const [state, formAction] = useActionState(deleteChangeLogAction, EMPTY_FORM_STATE);

  useEffect(() => {
    if (state.status === "ERROR") {
      toast.error(state.message);
      return;
    }
    if (state.status === "SUCCESS") {
      toast.success(state.message)
      onOpenAction(false)
      return;
    }
  }, [state]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenAction}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this changelog entry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>
          <form action={(data) => {
            data.set("id", id)
            data.set("projectId", projectId)
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
