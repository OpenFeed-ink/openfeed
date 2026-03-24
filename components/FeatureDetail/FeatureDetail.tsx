import { eq } from "drizzle-orm";
import { feature } from "@/db/schema";
import { Separator } from "@/components/ui/separator";
import { databaseDrizzle } from "@/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpvoteButton } from "../UpvoteButton/UpvoteButton";
import { UpsertFeature } from "../UpsertFeature/UpsertFeature";
import { AddComments } from "../AddComments/AddComments";
import { CommentProvider } from "@/contexts/CommentProvider";
import { RenderComment } from "../RenderComment/RenderComment";
import { Author, CommentNode, statusColors, statusLabels } from "@/type"
import { DeleteFeature } from "../DeleteFeature/DeleteFeature";
import { Badge } from "@/components/ui/badge";
import { FormatDistanceToNow } from "../FromatDistanceToNow/FormatDistanceToNow";
import { NoFeatureRequest } from "./NoFeatureRequest";
import { CommentsContainer } from "./CommentsContainer";

export async function FeatureDetail({ featureId, user, projectId, pub }: {
  featureId: string,
  projectId:string,
  user: Author,
  pub?:boolean
}) {
  const featureData = await databaseDrizzle.query.feature.findFirst({
    where: eq(feature.id, featureId),
    with: {
      author: {
        columns: {
          id: true,
          name: true,
        },
        with: {
          usersProjects: {
            where: (up, ops) => ops.eq(up.projectId, projectId),
            columns: { role: true, userId: true },
          }
        }
      },
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
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
      },
      upvotes: {
        where: (u, ops) => ops.eq(u.voterToken, user.id),
        columns: { id: true },
      },
      tags: { with: { tag: true } },
    },
  });

  if (!featureData) return <NoFeatureRequest />
  const commentsTree = buildCommentTree(featureData.comments, featureData.pinnedComment)
  const authorRole = featureData.author?.usersProjects[0]?.role ?? "ANONYMOUS";

  return (
    <Card className={`w-full ${!pub ? "h-full": ""}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          {/* Prominent upvote button */}
          <div className="flex flex-col items-center">
            <UpvoteButton
              projectId={featureData.projectId}
              featureId={featureData.id}
              voterToken={user.id}
              initialCount={featureData.upvotesCount}
              initialVoted={featureData.upvotes.length > 0}
            />
          </div>

          {/* Title and metadata */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl">{featureData.title}</CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Submitted{" "}
              <FormatDistanceToNow createdAt={featureData.createdAt} />
              {" "}
              {featureData.authorId ? (
                <span className="capitalize">by {featureData.authorName} ({authorRole.toLowerCase()})</span>
              ) : featureData.authorEmail ? (
                <span> by {featureData.authorEmail}</span>
              ) : featureData.authorName ? (
                <span> by {featureData.authorName}</span>
              ) : null}
            </div>
            <Badge className={statusColors[featureData.status]}>
              {statusLabels[featureData.status]}
            </Badge>
          </div>

          {/* Action buttons (edit/delete) */}
          <div className="flex items-center gap-2">
            <UpsertFeature
              projectId={featureData.projectId}
              feature={featureData}
              availableTags={[]}
              userId={user.id}
              userName={user.name}
              projectFeatureCount={0}
            />
            <DeleteFeature
              id={featureData.id}
              projectId={featureData.projectId}
              userId={user.id}
              authorId={featureData.authorId}
            />
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
        <div className="flex flex-wrap gap-2 mt-1">
          {featureData.tags.map(({ tag }) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs px-1 py-0"
              style={{ borderColor: tag.color }}
            >
              <div className="h-1.5 w-1.5 rounded-full mr-1" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </Badge>
          ))}
        </div>
        {/* Comments */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            Comments ({featureData.comments.length})
          </h3>
          <CommentsContainer>
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
                  >
                    {commentsTree.map((comment) => (
                      <RenderComment key={comment.id} userId={user.id} userName={user.name} comment={comment} />
                    ))}
                  </CommentProvider>
                )}
              </div>
            </div>
          </CommentsContainer>
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
