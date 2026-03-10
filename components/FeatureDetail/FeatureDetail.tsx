import { eq } from "drizzle-orm";
import { feature } from "@/db/schema";
import { Separator } from "@/components/ui/separator";
import { databaseDrizzle } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link"
import { UpvoteButton } from "../UpvoteButton/UpvoteButton";
import { UpsertFeature } from "../UpsertFeature/UpsertFeature";
import { Sparkles } from "lucide-react";
import { AddComments } from "../AddComments/AddComments";
import { CommentProvider } from "@/contexts/CommentProvider";
import { RenderComment } from "../RenderComment/RenderComment";
import { Author, CommentNode } from "@/type"
import { permission } from "@/lib/utils";
import { DeleteFeature } from "../DeleteFeature/DeleteFeature";
import { notFound } from "next/navigation";


type Membership = {
  userId: string;
  role: "ADMIN" | "MEMBER";
}


export async function FeatureDetail({ featureId, user, memberships, pub }: {
  featureId: string,
  user: Author,
  memberships: Membership[],
  pub?: boolean,
}) {

  const featureData = await databaseDrizzle.query.feature.findFirst({
    where: eq(feature.id, featureId),
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
        orderBy: (comments, { desc }) => [desc(comments.createdAt)]
      },
      upvotes: {
        where: (u, ops) => ops.eq(u.voterToken, user.id),
        columns: { id: true }
      },
      tags: { with: { tag: true } },
    }
  });

  const permit = permission(memberships, user.id)

  if (!featureData) return notFound();
  const commentsTree = buildCommentTree(featureData.comments, featureData.pinnedComment)

  const authorPermit = permission(memberships, featureData.authorId)
  return (
    <Card className={`${pub ? "w-full h-screen" : "h-full"}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Prominent upvote button */}
          <div className="flex flex-col items-center">
            <UpvoteButton
              projectId={featureData.projectId}
              featureId={featureData.id}
              voterToken={user.id}
            />
          </div>

          {/* Title and metadata */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">{featureData.title}</CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Submitted{" "}
              {formatDistanceToNow(new Date(featureData.createdAt), { addSuffix: true })}
              {featureData.authorId ? (
                <Button asChild variant="link" className="px-1">
                  {permit.role !== "anonymous" ? <Link href={`/projects/${featureData.projectId}/team`}>
                    by {featureData.authorName} ({authorPermit.role})
                  </Link> : <p>by {featureData.authorName} ( {authorPermit.role} )</p>}
                </Button>
              ) : featureData.authorEmail ? (
                <span> by {featureData.authorEmail}</span>
              ) : featureData.authorName ? (
                <span> by {featureData.authorName}</span>
              ) : null}
            </div>
          </div>

          {/* Action buttons (edit/delete) */}
          <div className="flex items-center gap-2">
            {(permit.editFeature || featureData.authorId === user.id) && (
              <UpsertFeature
                projectId={featureData.projectId}
                feature={featureData}
                availableTags={[]}
              />
            )}
            {(permit.deleteAnyFeature || featureData.authorId === user.id) && (
              <DeleteFeature
                id={featureData.id}
                projectId={featureData.projectId}
              />
            )}
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="space-y-6 py-6">
        {/* Description */}
        {featureData.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {featureData.description}
            </p>
          </div>
        )}

        {/* AI Summary */}
        {featureData.aiSummary || permit.generateAiSummary &&
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" />
              AI Summary
            </h3>
            {featureData.aiSummary ? (
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {featureData.aiSummary}
              </p>
            ) : permit.generateAiSummary ? (
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
            ) : <div />}
          </div>}

        {/* Comments */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            Comments ({featureData.comments.length})
          </h3>

          <div className="max-h-80 min-h-80 overflow-y-auto">
            <div className="overflow-x-auto pb-2">
              <div className="space-y-4 w-max">
                {commentsTree.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                  <CommentProvider
                    feature={{
                      id: featureData.id,
                      projectId: featureData.projectId,
                      comments: commentsTree,
                      pinCommentId: featureData.pinnedComment,
                    }}
                    user={user}
                    memberships={memberships}
                  >
                    {commentsTree.map((comment) => (
                      <RenderComment key={comment.id} userId={user.id} userName={user.name} comment={comment} />
                    ))}
                  </CommentProvider>
                )}
              </div>
            </div>
          </div>
          <AddComments
            featureId={featureData.id}
            projectId={featureData.projectId}
            userId={user.id}
            userName={user.name}
          />
        </div>
      </CardContent>
    </Card>

  );
}

type DbComment = Omit<CommentNode, "replies">

function buildCommentTree(comments: DbComment[], pinnedCommentId?: string | null): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];
  let pinnedComment: CommentNode | null = null

  for (const comment of comments) {
    map.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.id === pinnedCommentId) {
      pinnedComment = node
    } else if (comment.parentId) {
      const parent = map.get(comment.parentId);
      parent?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  pinnedComment && roots.unshift(pinnedComment)
  return roots
}
