import { Card, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { databaseDrizzle } from "@/db";
import { project } from "@/db/schema";
import { statusColors, statusLabels } from "@/type";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FeatureHeaderCard } from "@/components/Pub/FeatureCard";
import ThemeController from "@/components/ThemeController";
type FeatureStatus =
  | "under_review"
  | "planned"
  | "in_progress"
  | "done"
  | "closed";

const statuses = [
  { value: "under_review", label: statusLabels["under_review"], color: statusColors["under_review"] },
  { value: "planned", label: statusLabels["planned"], color: statusColors["planned"] },
  { value: "in_progress", label: statusLabels["in_progress"], color: statusColors["in_progress"] },
  { value: "done", label: statusLabels["done"], color: statusColors["done"] },
  { value: "closed", label: statusLabels["closed"], color: statusColors["closed"] },
];
export default async function page({ params, searchParams }: { params: Promise<{ projectId: string }>, searchParams: Promise<{ theme: string }> }) {
  const { projectId } = await params
  const { theme } = await searchParams
  const proj = await databaseDrizzle.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: {
      roadmapHiddenColumns: true,
    },
  })
  if (!proj) return notFound()

  const features = await databaseDrizzle.query.feature.findMany({
    where: (f, ops) =>
      ops.and(
        ops.eq(f.projectId, projectId),
        ops.notInArray(f.status, proj.roadmapHiddenColumns as FeatureStatus[])
      ),
    columns: {
      id: true,
      title: true,
      description: true,
      upvotesCount: true,
      status: true,
      createdAt: true,
    },
    with: {
      tags: { columns: {}, with: { tag: true } },
      comments: { columns: { id: true } },
    },
    orderBy: (f, { asc }) => [asc(f.createdAt)],
  });

  return (
    <ThemeController theme={theme}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map((status) => !proj.roadmapHiddenColumns.includes(status.value) && (
          <div key={status.value} className="w-72 shrink-0 bg-muted/30 rounded-lg p-3">
            <div className="flex justify-between mb-3">
              <h3 className={`text-sm font-medium px-2 py-1 rounded ${status.color}`}>
                {status.label}
              </h3>
              <span className="text-xs text-muted-foreground">
                {features.length}
              </span>
            </div>
            <div className="space-y-2">
              {features.map((feature) => feature.status === status.value && (
                <Card key={feature.id} className="hover:border-teal-500/40 hover:shadow-sm transition">
                  <FeatureHeaderCard featureId={feature.id}>
                    <div className="flex justify-between">
                      <CardTitle className="text-sm line-clamp-1">
                        {feature.title}
                      </CardTitle>
                      <Badge className={statusColors[feature.status]}>
                        {statusLabels[feature.status]}
                      </Badge>
                    </div>
                    {feature.description && (
                      <CardDescription className="text-xs line-clamp-2">
                        {feature.description}
                      </CardDescription>
                    )}
                    {feature.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {feature.tags.map(({ tag }) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-[10px] px-1 py-0"
                            style={{ borderColor: tag.color }}
                          >
                            <div
                              className="h-1 w-1 rounded-full mr-1"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </FeatureHeaderCard>
                  <CardFooter className="p-4 pt-2 text-xs text-muted-foreground">
                    <div className="flex justify-between w-full">
                      <div className="flex gap-3">
                        <span className="flex gap-1 items-center">
                          {feature.upvotesCount || 0}
                          <ThumbsUp className="h-3 w-3" />
                        </span>
                        <span className="flex gap-1 items-center">
                          <MessageSquare className="h-3 w-3" />
                          {feature.comments.length || 0}
                        </span>
                      </div>
                      <span>
                        {formatDistanceToNow(
                          new Date(feature.createdAt),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}

              {features.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-6">
                  None
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ThemeController>
  )
}
