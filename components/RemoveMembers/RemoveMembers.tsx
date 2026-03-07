"use client"
import { Button } from "@/components/ui/button"
import { UserMinus } from "lucide-react"
import { useTransition } from "react";
import { toast } from "sonner";

export const RemoveMembers = ({ projectId, userName, userId }: { projectId: string, userName: string, userId: string }) => {
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    if (confirm(`Are you sure you want to remove ${userName} from the team?`)) {
      startTransition(async () => {
        const formData = new FormData();
        formData.append("projectId", projectId);
        formData.append("userId", userId);
        try {
          //  await removeMemberAction(formData);
          toast.success("Member removed");
        } catch (error: any) {
          toast.error(error.message || "Failed to remove member");
        }
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleRemove}
      disabled={isPending}
    >
      <UserMinus className="h-4 w-4 text-muted-foreground hover:text-destructive" />
    </Button>
  )
}
