"use client";

import * as motion from "motion/react-client";
import { useActionState, startTransition, useEffect, useOptimistic } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { upvotesAction } from "@/actions/upvotes";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { toast } from "sonner";

interface UpvoteButtonProps {
  featureId: string;
  projectId: string;
  voterToken: string;
  initialCount: number;
  initialVoted: boolean;
  size?: "sm" | "default";
}

export function UpvoteButton({
  featureId,
  projectId,
  voterToken,
  size = "default",
  initialVoted,
  initialCount
}: UpvoteButtonProps) {
  // Optimistic state lives on the button itself, keyed off its own props —
  // not in a page-wide shared record. A page-wide record meant clicking one
  // feature's vote re-rendered every UpvoteButton on the page, not just the
  // one that changed.
  const [vote, toggleVote] = useOptimistic(
    { voted: initialVoted, count: initialCount },
    (current: { voted: boolean; count: number }, _action: void) => {
      const newVoted = !current.voted;
      return { voted: newVoted, count: current.count + (newVoted ? 1 : -1) };
    }
  );

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
      toggleVote();
      formAction(data);
    });
  }

  const sizeClasses = size === "sm" ? "h-7 px-2 text-xs" : "h-[70px] px-3";
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleClick}
      className={`group relative overflow-hidden transition-all cursor-pointer ${sizeClasses} ${vote.voted
        ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400"
        : ""
        }`}
    >
      <motion.div
        className="flex items-center gap-1"
        animate={vote.voted ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <ArrowUp
          className={`h-3 w-3 transition-transform ${vote.voted ? "-translate-y-0.5" : ""
            }`}
        />
        <motion.span key={vote.count}>
          {vote.count}
        </motion.span>
      </motion.div>
    </Button>
  );
}
