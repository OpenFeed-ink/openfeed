import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send } from "lucide-react";
import { UpsertFeature } from "../UpsertFeature/UpsertFeature";
import Link from "next/link"
import { UpvoteButton } from "../UpvoteButton/UpvoteButton";
import { databaseDrizzle } from "@/db";
import { User } from "better-auth";


export async function FeatureDetail({ featureId, projectId, user }: { featureId: string, projectId: string, user: User }) {
  const localFeature = await databaseDrizzle.query.feature.findFirst({
    where: (f, ops) =>
      ops.and(
        ops.eq(f.id, featureId),
        ops.eq(f.projectId, projectId)
      ),
    with: {
      comments: {
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      upvotes: {
        where: (u, ops) =>
          ops.or(
            ops.eq(u.voterToken, user.id),
            ops.eq(u.voterEmail, user.email)
          ),
        columns: { id: true },
      },
    },
  })


  if (!localFeature) return (<div className="flex h-full min-h-100 items-center justify-center rounded-lg border bg-card p-8 text-center">
    <div>
      <div className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-medium">No feedback Found</h3>
      <p className="text-sm text-muted-foreground">
        Click on a feedback item to view details
      </p>
    </div>
  </div>)
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{localFeature.title}</CardTitle>
            Submitted{" "}
            {formatDistanceToNow(new Date(localFeature.createdAt), { addSuffix: true })}
            {localFeature.authorId ? <Button asChild variant='link'>
              <Link href={`/profile/${localFeature.authorId}`} className="text-sm text-muted-foreground" >
                by {localFeature.authorName}
              </Link>
            </Button> : localFeature.authorEmail ?
              <p>by {localFeature.authorEmail}</p> :
              localFeature.authorName ? <p>by {localFeature.authorName}</p> : <p />
            }
          </div>
          <div className="flex items-center gap-4">
            <UpvoteButton
              projectId={localFeature.projectId}
              featureId={localFeature.id}
            />
            <UpsertFeature projectId={localFeature.projectId} feature={localFeature} />
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6 py-6">
        {/* Description */}
        {localFeature.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {localFeature.description}
            </p>
          </div>
        )}

        {/* AI Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600" />
            AI Summary
          </h3>
          {localFeature.aiSummary ? (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {localFeature.aiSummary}
            </p>
          ) : (
            <Button
              variant="outline"
              size="sm"
            >
              {false ? (
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
            Comments ({localFeature.comments.length})
          </h3>

          <ScrollArea className="max-h-80 overflow-y-auto pr-3">
            <div className="space-y-4">
              {localFeature.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className={
                        comment.autherId
                          ? "bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-100"
                          : "bg-muted"
                      }
                    >
                      {comment.authorName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {comment.authorName || "Anonymous"}
                      </span>
                      {comment.autherId && (
                        <Badge variant="outline" className="text-xs">
                          Team
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Add comment */}
          <form className="flex gap-2">
            <Textarea
              placeholder="Reply as team..."
              className="min-h-15 resize-none"
            />
            <Button
              type="submit"
              size="icon"
              className="h-15 w-15 bg-teal-600 hover:bg-teal-700"
            >
              {false ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
