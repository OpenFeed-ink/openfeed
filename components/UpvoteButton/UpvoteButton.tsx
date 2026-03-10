"use client";

import * as motion from "motion/react-client";
import { useActionState, startTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { upvotesAction } from "@/actions/upvotes";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { toast } from "sonner";
import { useUpvote } from "@/contexts/UpvoteProvider";

interface UpvoteButtonProps {
  featureId: string;
  projectId: string;
  voterToken: string;
  size?: "sm" | "default";
}

export function UpvoteButton({
  featureId,
  projectId,
  voterToken,
  size = "default",
}: UpvoteButtonProps) {
  const { votes, toggleVote } = useUpvote();
  const vote = votes[featureId];

  const [state, formAction] = useActionState(
    upvotesAction,
    EMPTY_FORM_STATE
  );

  useEffect(() => {
    if (state.status === "ERROR") {
      toast.error(state.message);
    }
  }, [state]);

  function handleClick() {
    const data = new FormData();
    data.set("featureId", featureId);
    data.set("projectId", projectId);
    data.set("voterToken", voterToken);

    startTransition(() => {
      toggleVote(featureId);
      formAction(data);
    });
  }

  const sizeClasses = size === "sm" ? "h-7 px-2 text-xs" : "h-16 px-3";

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleClick}
      className={`group relative overflow-hidden transition-all cursor-pointer ${sizeClasses} ${vote?.voted
        ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400"
        : ""
        }`}
    >
      <motion.div
        className="flex items-center gap-1"
        animate={vote?.voted ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <ArrowUp
          className={`h-3 w-3 transition-transform ${vote?.voted ? "-translate-y-0.5" : ""
            }`}
        />
        <motion.span key={vote?.count}>
          {vote?.count}
        </motion.span>
      </motion.div>
    </Button>
  );
}
