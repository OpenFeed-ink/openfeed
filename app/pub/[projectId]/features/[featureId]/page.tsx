import { FeatureDetail } from "@/components/FeatureDetail/FeatureDetail"
import ThemeController from "@/components/ThemeController"
import { AuthorizationProvider } from "@/contexts/AuthorizationProvider"
import { ProjectPermissionProvider } from "@/contexts/ProjectPermissionProvider"
import { databaseDrizzle } from "@/db"
import { getAuthorizationWithProject } from "@/lib/billing/getAuthorization"
import { getProjectPermission } from "@/lib/permission/getProjectPermission"
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

  // Only this page (edit/delete/pin/comment permission checks) needs
  // authorization + permission context among /pub routes — fetched here,
  // in parallel with the feature-existence check, instead of on every
  // /pub/* request. FeatureDetail below runs its own full feature query
  // (including upvote state) and feeds UpvoteButton's initial props directly,
  // so this only needs to confirm the feature exists in this project for the
  // 404 check — not fetch its upvotes too.
  const [featureExists, auth, { permissions }] = await Promise.all([
    databaseDrizzle.query.feature.findFirst({
      where: (f, ops) => ops.and(ops.eq(f.projectId, projectId), ops.eq(f.id, featureId)),
      columns: { id: true },
    }),
    getAuthorizationWithProject(projectId),
    getProjectPermission(projectId),
  ])

  if (!featureExists) return notFound()


  return (
    <ThemeController theme={theme}>
      <AuthorizationProvider value={auth}>
        <ProjectPermissionProvider memeberships={permissions} userId={user.id}>
          <FeatureDetail
            projectId={projectId}
            user={user}
            featureId={featureId}
            pub={true}
          />
        </ProjectPermissionProvider>
      </AuthorizationProvider>
    </ThemeController>
  )
}

