"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  startTransition,
} from "react";

type FeatureVoteState = {
  voted: boolean;
  count: number;
};

type UpvoteContextType = {
  votes: Record<string, FeatureVoteState>;
  toggleVote: (featureId: string) => void;
};

const UpvoteContext = createContext<UpvoteContextType | null>(null);

export function UpvoteProvider({
  children,
  initialVotes,
}: {
  children: React.ReactNode;
  initialVotes: Record<string, FeatureVoteState>;
}) {
  const [optimisticVotes, updateOptimistic] = useOptimistic(
    initialVotes,
    (current, featureId: string) => {
      const feature = current[featureId];
      if (!feature) return current;

      const newVoted = !feature.voted;

      return {
        ...current,
        [featureId]: {
          voted: newVoted,
          count: feature.count + (newVoted ? 1 : -1),
        },
      };
    }
  );

  function toggleVote(featureId: string) {
    startTransition(() => {
      updateOptimistic(featureId);
    });
  }

  return (
    <UpvoteContext.Provider
      value={{ votes: optimisticVotes, toggleVote }}
    >
      {children}
    </UpvoteContext.Provider>
  );
}

export function useUpvote() {
  const ctx = useContext(UpvoteContext);
  if (!ctx) throw new Error("useUpvote must be inside UpvoteProvider");
  return ctx;
}
