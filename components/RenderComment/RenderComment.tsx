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

export function RenderComment({ comment, depth = 0 }: { comment: CommentNode; depth?: number }) {
  const {
    user,
    feature,
    memberships,
    replyingTo,
    setReplyingTo,
    pinComment,
    pinCommentId,
  } = useComment();

  const isAuthor = comment.authorId === user.id;
  const permit = permission(memberships, comment.authorId, user.id);
  const isPinned = comment.id === pinCommentId;

  // Limit nesting depth for visual sanity
  const maxDepth = 10;
  const indentClass = depth > 0 ? "ml-6 border-l-2 border-muted pl-4" : "";
  const pinnedClass = isPinned ? "rounded-md bg-yellow-50 dark:bg-yellow-950/30 p-3" : "";

  return (
    <div className={`space-y-2 ${indentClass} ${pinnedClass}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={comment.author?.image ?? undefined} />
          <AvatarFallback className="bg-muted">
            {comment.authorName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">
                {comment.authorName || "Anonymous"}
              </span>

              {comment.authorId && (
                <Badge variant="outline" className="text-xs capitalize">
                  {memberships.find((m) => m.userId === comment.authorId)?.role.toLowerCase() || "Anonymous"}
                </Badge>
              )}

              {isPinned && (
                <Badge className="text-xs">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}

              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="flex gap-1">
              {permit.canPin && depth === 0 && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => pinComment(comment.id, !isPinned)}
                  title={isPinned ? "Unpin" : "Pin"}
                >
                  {isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </Button>
              )}

              {isAuthor && (
                <DeleteComment
                  projectId={feature.projectId}
                  featureId={feature.id}
                  commentId={comment.id}
                />
              )}
            </div>
          </div>

          <p className="text-sm text-foreground whitespace-pre-wrap">
            {comment.content}
          </p>
          {depth < maxDepth && (
            <Button
              size="sm"
              variant="ghost"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setReplyingTo(comment.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>)}

          {replyingTo === comment.id && (
            <div className="mt-3">
              <AddComments
                featureId={feature.id}
                projectId={feature.projectId}
                parentId={replyingTo}
                afterAction={() => setReplyingTo(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="space-y-3 mt-2">
          {comment.replies.map((reply) => (
            <RenderComment
              key={reply.id}
              comment={reply}
              depth={Math.min(depth + 1, maxDepth)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
