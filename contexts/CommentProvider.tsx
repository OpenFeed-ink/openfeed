"use client";

import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { Author, CommentNode } from "@/type"
import { pinCommentAction } from "@/actions/comments";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";

type Feature = {
  id: string;
  projectId: string;
  comments: CommentNode[];
  pinCommentId: string | null
};

type CommentContextType = {
  feature: Feature;
  user: Author;
  memberships: { userId: string; role: "ADMIN" | "MEMBER" }[];

  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;

  pinCommentId: string | null

  pinComment: (commentId: string, pin: boolean) => Promise<void>;
};

const CommentContext = createContext<CommentContextType | null>(null);

export function CommentProvider({
  feature,
  user,
  memberships,
  children,
}: {
  feature: Feature;
  user: Author;
  memberships: { userId: string; role: "ADMIN" | "MEMBER" }[];
  children: React.ReactNode;
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const pinComment = async (commentId: string, pin: boolean) => {
    const formData = new FormData();

    pin && formData.append("id", commentId);
    formData.append("featureId", feature.id);
    formData.append("projectId", feature.projectId)
    const response = await pinCommentAction(EMPTY_FORM_STATE, formData)
    if (response.status === 'ERROR') {
      toast.error(response.message || "Failed to update pin");
      return
    }
    if (response.status === 'SUCCESS') {
      toast.success(response.message)
    }
  };

  return (
    <CommentContext.Provider
      value={{
        feature,
        user,
        memberships,
        replyingTo,
        setReplyingTo,
        pinComment,
        pinCommentId: feature.pinCommentId
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}

export function useComment() {
  const ctx = useContext(CommentContext);

  if (!ctx) {
    throw new Error("useComment must be used inside CommentProvider");
  }

  return ctx;
}
