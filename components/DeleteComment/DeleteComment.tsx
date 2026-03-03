"use client"
import { deleteCommentAction } from "@/actions/comments";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { RotateCcwIcon, Trash2 } from "lucide-react";

export const DeleteComment = ({ commentId, projectId, featureId }: { commentId: string, projectId: string, featureId: string }) => {
  const [state, formAction] = useActionState(deleteCommentAction, EMPTY_FORM_STATE);

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
    <form action={(data) => {
      data.set("projectId", projectId)
      data.set("featureId", featureId)
      data.set("id", commentId)
      formAction(data)
    }}>
      <DeleteBtn />
    </form>
  )
}

const DeleteBtn = () => {
  const { pending } = useFormStatus();

  return (<Button
    variant="ghost"
    size="icon"
    className="cursor-pointer"
    disabled={pending}>
    {pending ? <RotateCcwIcon className="animate-spin text-destructive" /> : <Trash2 className="h-4 w-4 text-destructive hover:text-red-500" />}
  </Button>)
}
