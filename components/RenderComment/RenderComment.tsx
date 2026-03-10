"use client";

import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, PinOff, Reply } from "lucide-react";
import { DeleteComment } from "@/components/DeleteComment/DeleteComment";
import { useComment } from "@/contexts/CommentProvider";
import { CommentNode } from "@/type";
import { permission } from "@/lib/utils";
import { AddComments } from "../AddComments/AddComments";
import { useIsMobile } from "@/hooks/use-mobile";

export function RenderComment({ comment, userName, userId, depth = 0 }: { comment: CommentNode; userName: string, userId: string; depth?: number }) {
  const {
    user,
    feature,
    memberships,
    replyingTo,
    setReplyingTo,
    pinComment,
    pinCommentId,
  } = useComment();

  const isMobile = useIsMobile();
  const isAuthor = comment.authorId === user.id || comment.visitorToken === user.id;
  const permit = permission(memberships, user.id);
  const isPinned = comment.id === pinCommentId;

  const maxDepth = 10;
  const effectiveDepth = Math.min(depth, maxDepth);

  const indentClass = effectiveDepth > 0
    ? (isMobile ? "ml-2 border-l border-muted pl-2" : "ml-6 border-l-2 border-muted pl-4")
    : "";
  const pinnedClass = isPinned ? "rounded-md bg-yellow-50 dark:bg-yellow-950/30 p-3" : "";

  return (
    <div className={`space-y-2 ${indentClass} ${pinnedClass}`}>
      <div className="flex gap-2 sm:gap-3">
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1 shrink-0">
          <AvatarImage src={comment.author?.image ?? undefined} />
          <AvatarFallback className="bg-muted text-xs">
            {comment.authorName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header with metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="text-sm font-semibold truncate max-w-30 sm:max-w-none">
                {comment.authorName || "Anonymous"}
              </span>

              {comment.authorId && (
                <Badge variant="outline" className="text-xs px-1 py-0 capitalize">
                  {memberships.find((m) => m.userId === comment.authorId)?.role.toLowerCase() || "Member"}
                </Badge>
              )}

              {isPinned && (
                <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300 px-1 py-0">
                  <Pin className="h-3 w-3 mr-0.5" />
                  Pinned
                </Badge>
              )}

              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="flex gap-1 self-end items-center sm:self-auto">
              {permit.canPin && depth === 0 && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 sm:h-8 sm:w-8"
                  onClick={() => pinComment(comment.id, !isPinned)}
                  title={isPinned ? "Unpin" : "Pin"}
                >
                  {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </Button>
              )}

              {(isAuthor || permit.deleteComment) && (
                <DeleteComment
                  projectId={feature.projectId}
                  featureId={feature.id}
                  commentId={comment.id}
                />
              )}
            </div>
          </div>

          {/* Comment content */}
          <p className="text-sm text-foreground whitespace-pre-wrap wrap-break-word mt-1 max-w-112.5">
            {comment.content}
          </p>

          {/* Reply button */}
          {depth < maxDepth && <Button
            size="sm"
            variant="ghost"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground mt-1"
            onClick={() => setReplyingTo(comment.id)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>}

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-3">
              <AddComments
                featureId={feature.id}
                projectId={feature.projectId}
                parentId={replyingTo}
                userName={userName}
                userId={userId}
                afterAction={() => setReplyingTo(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="space-y-3 mt-2">
          {comment.replies.map((reply) => (
            <RenderComment
              key={reply.id}
              userName={userName}
              userId={userId}
              comment={reply}
              depth={effectiveDepth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
