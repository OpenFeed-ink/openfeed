import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { UpsertFeature } from "../UpsertFeature/UpsertFeature";
import Link from "next/link"
import { UpvoteButton } from "../UpvoteButton/UpvoteButton";
import { databaseDrizzle } from "@/db";
import { User } from "better-auth";
import { DeleteFeature } from "../DeleteFeature/DeleteFeature";
import { AddComments } from "../AddComments/AddComments";
import { DeleteComment } from "../DeleteComment/DeleteComment";
import { permission } from "@/lib/utils";


export async function FeatureDetail({ featureId, projectId, user, memberships }: {
  featureId: string,
  projectId: string,
  user: User,
  memberships: {
    userId: string;
    role: "ADMIN" | "MEMBER";
  }[]
}) {

  const feature = await databaseDrizzle.query.feature.findFirst({
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


  if (!feature) return (<div className="flex h-full min-h-100 items-center justify-center rounded-lg border bg-card p-8 text-center">
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
            <CardTitle className="text-xl">{feature.title}</CardTitle>
            Submitted{" "}
            {formatDistanceToNow(new Date(feature.createdAt), { addSuffix: true })}
            {feature.authorId ? <Button asChild variant='link'>
              <Link href={`/profile/${feature.authorId}`} className="text-sm text-muted-foreground" >
                by {feature.authorName}
              </Link>
            </Button> : feature.authorEmail ?
              <p>by {feature.authorEmail}</p> :
              feature.authorName ? <p>by {feature.authorName}</p> : <p />
            }
            <DeleteFeature id={feature.id} projectId={feature.projectId} />
          </div>
          <div className="flex items-center gap-4">
            <UpvoteButton
              projectId={feature.projectId}
              featureId={feature.id}
            />
            <UpsertFeature projectId={feature.projectId} feature={feature} />
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
            Comments ({feature.comments.length})
          </h3>

          <ScrollArea className="max-h-80 overflow-y-auto pr-3">
            <div className="space-y-4">
              {feature.comments.map((comment) => {
                const permit = permission(memberships, comment.authorId, user.id)

                return (<div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author?.image ?? undefined} alt={comment.author?.name} />
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
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {comment.authorName || "Anonymous"}
                        </span>
                        {comment.authorId && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {permit.role}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {permit.deleteComment && <DeleteComment projectId={projectId} featureId={featureId} commentId={comment.id} />}
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Add comment */}
          <AddComments featureId={featureId} projectId={projectId} />
        </div>
      </CardContent>
    </Card>
  );
}
