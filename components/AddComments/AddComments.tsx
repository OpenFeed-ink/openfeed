"use client";
import { Button } from "@/components/ui/button"
import { Textarea } from "../ui/textarea"
import { Send, Sparkles } from "lucide-react"
import { useActionState, useEffect } from "react";
import { upsertCommentAction } from "@/actions/comments";
import { toast } from "sonner";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { useFormStatus } from "react-dom";
import { comment } from "@/db/schema";


export const AddComments = ({ featureId, projectId, parentId, userId, userName, currentComment, afterAction }: {
  featureId: string,
  projectId: string,
  userId: string,
  userName: string,
  currentComment?: typeof comment.$inferInsert,
  parentId?: string,
  afterAction?: () => void
}) => {
  const [state, formAction] = useActionState(upsertCommentAction, EMPTY_FORM_STATE);

  useEffect(() => {
    if (state.status === "ERROR") {
      toast.error(state.message);
      return;
    }
  }, [state]);


  return (
    <form className="flex gap-2" action={(data) => {
      data.set("projectId", projectId)
      data.set("featureId", featureId)
      data.set("userId", userId),
      data.set("name", userName)

      if (parentId) data.set("parentId", parentId)
      formAction(data)
      afterAction?.()
    }} >
      <FeatureForm newComment={currentComment} />
    </form>
  )
}


const FeatureForm = ({ newComment }: { newComment?: typeof comment.$inferInsert }) => {
  const { pending } = useFormStatus();
  return (
    <div className="w-full flex gap-2">
      <Textarea
        name="content"
        id="content"
        placeholder="Reply as team..."
        className="min-h-15 resize-none"
        defaultValue={newComment?.content}
      />
      <Button
        type="submit"
        size="icon"
        className="h-15 w-15 bg-teal-600 hover:bg-teal-700"
        disabled={pending}
      >
        {pending ? (
          <Sparkles className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
