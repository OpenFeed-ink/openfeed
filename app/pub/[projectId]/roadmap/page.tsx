import { databaseDrizzle } from "@/db";
import { project } from "@/db/schema";
import { statusColors, statusLabels } from "@/type";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ThemeController from "@/components/ThemeController";
import { PubFeatureCard } from "@/components/Pub/PubFeatureCard";
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
  const featuresByStatus = features.reduce<Record<FeatureStatus, typeof features>>(
    (acc, current) => {
      acc[current.status].push(current);
      return acc;
    },
    {
      under_review: [],
      planned: [],
      in_progress: [],
      done: [],
      closed: [],
    }
  );

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
                {featuresByStatus[status.value as FeatureStatus].length}
              </span>
            </div>
            <div className="space-y-2">
              {featuresByStatus[status.value as FeatureStatus].map((feature) => (
                <PubFeatureCard key={feature.id} feature={feature} />
              ))}

              {featuresByStatus[status.value as FeatureStatus].length === 0 && (
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
