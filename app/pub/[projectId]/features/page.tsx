import { FeatureList } from "@/components/FeatureLists/FeatureList";
import ThemeController from "@/components/ThemeController";
import { UpvoteProvider } from "@/contexts/UpvoteProvider";
import { databaseDrizzle } from "@/db";
import { cookies } from 'next/headers'
import { notFound } from "next/navigation";

export default async function page({ params, searchParams }: { params: Promise<{ projectId: string }>, searchParams: Promise<{ theme: string }> }) {
  const { projectId } = await params
  const { theme } = await searchParams
  const cookieStore = await cookies()

  const visitorToken = cookieStore.get("visitor_token")?.value

  if (!visitorToken) return notFound()

  const features = await databaseDrizzle.query.feature.findMany({
    where: (f, ops) => ops.eq(f.projectId, projectId),
    orderBy: (f, ops) => ops.desc(f.createdAt),
    with: {
      comments: { columns: { id: true } }, // only count for list
      upvotes: {
        where: (u, ops) =>
          ops.eq(u.voterToken, visitorToken),
        columns: { id: true },
      },
      tags: { with: { tag: true } },
    },
  });

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
        <FeatureList
          features={features}
          totalPages={1}
          currentPage={1}
          userId={visitorToken}
          pub={true}
        />
      </UpvoteProvider>
    </ThemeController>
  )
}
