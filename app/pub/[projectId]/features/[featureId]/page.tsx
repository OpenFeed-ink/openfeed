import { FeatureDetail } from "@/components/FeatureDetail/FeatureDetail"
import ThemeController from "@/components/ThemeController"
import { UpvoteProvider } from "@/contexts/UpvoteProvider"
import { databaseDrizzle } from "@/db"
import { getServerSession } from "@/lib/server/session"
import { isUUID } from "@/lib/utils"
import { Author } from "@/type"
import { cookies } from 'next/headers'
import { notFound } from "next/navigation"


export default async function page({ params, searchParams }: { params: Promise<{ projectId: string, featureId: string }>, searchParams: Promise<{ theme: string }> }) {
  const [{ featureId, projectId }, { theme }, session] = await Promise.all([params, searchParams, getServerSession()])

  if (!isUUID(featureId)) return notFound()

  let user: Author | null = null

  if (session?.user.id) {
    user = {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image ?? null,
    }
  } else {
    const cookieStore = await cookies()
    const visitorToken = cookieStore.get("visitor_token")?.value
    if (!visitorToken) return notFound()
    user = {
      id: visitorToken,
      name: `User-${visitorToken.slice(0, 4).toUpperCase()}`,
      image: null
    }
  }

  const featureData = await databaseDrizzle.query.feature.findFirst({
    where: (f, ops) => ops.and(ops.eq(f.projectId, projectId), ops.eq(f.id, featureId)),
    columns: {
      upvotesCount: true
    },
    with: {
      upvotes: {
        where: (u, ops) => ops.eq(u.voterToken, user.id),
        columns: { id: true },
      },
    },
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
        <FeatureDetail
          projectId={projectId}
          user={user}
          featureId={featureId}
          pub={true}
        />
      </UpvoteProvider>
    </ThemeController>
  )
}

