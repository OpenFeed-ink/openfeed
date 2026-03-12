import { FeatureDetail } from "@/components/FeatureDetail/FeatureDetail"
import ThemeController from "@/components/ThemeController"
import { UpvoteProvider } from "@/contexts/UpvoteProvider"
import { databaseDrizzle } from "@/db"
import { usersProjects } from "@/db/schema"
import { isUUID } from "@/lib/utils"
import { eq } from "drizzle-orm"
import { cookies } from 'next/headers'
import { notFound } from "next/navigation"


export default async function page({ params, searchParams }: { params: Promise<{ projectId: string, featureId: string }>, searchParams: Promise<{ theme: string }> }) {
  const { featureId, projectId } = await params
  const { theme } = await searchParams
  const cookieStore = await cookies()

  const visitorToken = cookieStore.get("visitor_token")?.value

  if (!visitorToken || !isUUID(featureId)) return notFound()

  const visitorUser = {
    id: visitorToken,
    email: "visitor@openfeed.ink",
    name: `User-${visitorToken.slice(0, 4).toUpperCase()}`,
    image: null
  }

  const featureData = await databaseDrizzle.query.feature.findFirst({
    where: (f, ops) => ops.and(ops.eq(f.projectId, projectId), ops.eq(f.id, featureId)),
    columns: {
      upvotesCount: true
    },
    with: {
      upvotes: {
        where: (u, ops) => ops.eq(u.voterToken, visitorUser.id),
        columns: { id: true },
      },
    },
  });

  const memberships = await databaseDrizzle.query.usersProjects.findMany({
    where: eq(usersProjects.projectId, projectId),
    columns: { userId: true, role: true },
  });

  if (!featureData) return notFound()


  return (
    <ThemeController theme={theme}>
      <UpvoteProvider
        initialVotes={{
          [featureId]: {
            voted: featureData.upvotes.length > 0,
            count: featureData.upvotesCount,
          },
        }}
      >
        <FeatureDetail user={visitorUser} memberships={memberships} featureId={featureId} pub={true} />
      </UpvoteProvider>

    </ThemeController>
  )
}

