import { FeatureList } from "@/components/FeatureLists/FeatureList";
import ThemeController from "@/components/ThemeController";
import { UpvoteProvider } from "@/contexts/UpvoteProvider";
import { databaseDrizzle } from "@/db";
import { cookies } from 'next/headers'
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { feature } from "@/db/schema";

export default async function page({ params, searchParams }: { params: Promise<{ projectId: string }>, searchParams: Promise<{ theme?: string, page?: string }> }) {
  const { projectId } = await params
  const { theme = "system", page = "1" } = await searchParams
  const cookieStore = await cookies()
  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1)
  const pageSize = 15

  const visitorToken = cookieStore.get("visitor_token")?.value

  if (!visitorToken) return notFound()

  const [features, totalCountResult] = await Promise.all([
    databaseDrizzle.query.feature.findMany({
      where: (f, ops) => ops.eq(f.projectId, projectId),
      orderBy: (f, ops) => ops.desc(f.createdAt),
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      with: {
        comments: { columns: { id: true } }, // only count for list
        upvotes: {
          where: (u, ops) =>
            ops.eq(u.voterToken, visitorToken),
          columns: { id: true },
        },
        tags: { with: { tag: true } },
      },
    }),
    databaseDrizzle
      .select({ count: sql<number>`count(*)` })
      .from(feature)
      .where(eq(feature.projectId, projectId))
      .limit(1),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <ThemeController theme={theme}>
      <UpvoteProvider
        initialVotes={Object.fromEntries(
          features.map((f) => [
            f.id,
            { voted: f.upvotes.length > 0, count: f.upvotesCount },
          ])
        )}
      >
        <div className="w-full min-h-screen overflow-y-auto">
          <div className="space-y-4 py-2 w-full max-w-3xl mx-auto">
            <FeatureList
              features={features}
              totalPages={totalPages}
              currentPage={currentPage}
              userId={visitorToken}
              pub={true}
            />
          </div>
        </div>
      </UpvoteProvider>
    </ThemeController>
  )
}
