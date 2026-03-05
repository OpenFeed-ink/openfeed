"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Pin, PinOff, Reply } from "lucide-react";
import Link from "next/link";
import { DeleteComment } from "../DeleteComment/DeleteComment";
import { UpvoteButton } from "../UpvoteButton/UpvoteButton";
import { UpsertFeature } from "../UpsertFeature/UpsertFeature";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  authorName: string | null;
  authorId: string | null;
  author: { id: string; name: string; image: string | null } | null;
  isPinned: boolean;
  parentId: string | null;
  replies?: Comment[];
}

interface FeatureDetailClientProps {
  feature: {
    id: string;
    title: string;
    description: string | null;
    createdAt: Date;
    authorId: string | null;
    authorName: string | null;
    authorEmail: string | null;
    status: string;
    upvotesCount: number;
    upvotes: any[];
    comments: Comment[];
    projectId: string;
    aiSummary: string | null;
  };
  user: { id: string; name: string; email: string };
  memberships: { userId: string; role: "ADMIN" | "MEMBER" }[];
  canPin: boolean;
}

export function FeatureDetailClient({
  feature,
  user,
  memberships,
  canPin,
}: FeatureDetailClientProps) {
  const [comments, setComments] = useState(feature.comments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const pinnedComment = comments.find((c) => c.isPinned);
  const otherComments = comments.filter((c) => !c.isPinned && !c.parentId);

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!content.trim()) return;
    setSubmittingReply(true);
    // Optimistic update
    const newComment: Comment = {
      id: "temp-" + Date.now(),
      content,
      createdAt: new Date(),
      authorName: user.name,
      authorId: user.id,
      author: { id: user.id, name: user.name, image: null },
      isPinned: false,
      parentId: parentId || null,
      replies: [],
    };
    setComments((prev) => [...prev, newComment]);
    setReplyText("");
    setReplyingTo(null);
    // TODO: Call server action to persist
    setSubmittingReply(false);
  };

  const handlePinComment = async (commentId: string, pin: boolean) => {
    // Optimistic update
    setComments((prev) =>
      prev.map((c) => ({
        ...c,
        isPinned: pin ? (c.id === commentId ? true : false) : c.id === commentId ? false : c.isPinned,
      }))
    );
    // TODO: Call server action
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isAuthor = comment.authorId === user.id;
    const canPinThis = canPin && !comment.isPinned && !pinnedComment;

    return (
      <div key={comment.id} className={`flex gap-3 ${depth > 0 ? "ml-8" : ""}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author?.image ?? undefined} />
          <AvatarFallback
            className={
              comment.authorId
                ? "bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-100"
                : "bg-muted"
            }
          >
            {comment.authorName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">
                {comment.authorName || "Anonymous"}
              </span>
              {comment.authorId && (
                <Badge variant="outline" className="text-xs capitalize">
                  {memberships.find((m) => m.userId === comment.authorId)?.role || "Member"}
                </Badge>
              )}
              {comment.isPinned && (
                <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div className="flex gap-1">
              {canPinThis && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handlePinComment(comment.id, true)}
                >
                  <Pin className="h-3 w-3" />
                </Button>
              )}
              {canPin && comment.isPinned && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handlePinComment(comment.id, false)}
                >
                  <PinOff className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setReplyingTo(comment.id)}
              >
                <Reply className="h-3 w-3" />
              </Button>
              {isAuthor && (
                <DeleteComment
                  projectId={feature.projectId}
                  featureId={feature.id}
                  commentId={comment.id}
                />
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.content}</p>

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="mt-2 flex gap-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <Button
                size="sm"
                onClick={() => handleAddComment(replyText, comment.id)}
                disabled={submittingReply || !replyText.trim()}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {submittingReply ? (
                  <Sparkles className="h-4 w-4 animate-spin" />
                ) : (
                  "Reply"
                )}
              </Button>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{feature.title}</CardTitle>
            <div className="text-sm text-muted-foreground">
              Submitted{" "}
              {formatDistanceToNow(new Date(feature.createdAt), { addSuffix: true })}
              {feature.authorId ? (
                <Button asChild variant="link" className="px-1">
                  <Link href={`/profile/${feature.authorId}`}>by {feature.authorName}</Link>
                </Button>
              ) : feature.authorEmail ? (
                <span> by {feature.authorEmail}</span>
              ) : feature.authorName ? (
                <span> by {feature.authorName}</span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UpvoteButton projectId={feature.projectId} featureId={feature.id} />
            <UpsertFeature
              projectId={feature.projectId}
              feature={feature}
              availableTags={[]} // Pass available tags if needed
            />
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6 py-6">
        {/* Description */}
        {feature.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {feature.description}
            </p>
          </div>
        )}

        {/* AI Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            AI Summary
          </h3>
          {feature.aiSummary ? (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {feature.aiSummary}
            </p>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGeneratingSummary(true)}
              disabled={generatingSummary}
            >
              {generatingSummary ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Summary
                </>
              )}
            </Button>
          )}
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            Comments ({comments.length})
          </h3>

          <ScrollArea className="max-h-80 overflow-y-auto pr-3">
            <div className="space-y-4">
              {/* Pinned comment first */}
              {pinnedComment && renderComment(pinnedComment)}
              {/* Other top-level comments */}
              {otherComments.map((comment) => renderComment(comment))}
            </div>
          </ScrollArea>

          {/* Add top-level comment */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={replyingTo === null ? replyText : ""}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[60px]"
            />
            <Button
              size="icon"
              onClick={() => handleAddComment(replyText)}
              disabled={submittingReply || !replyText.trim()}
              className="h-[60px] w-[60px] bg-teal-600 hover:bg-teal-700"
            >
              {submittingReply ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
