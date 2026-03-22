import { NewFeatureRequest } from "@/components/NewFeatureRequest/NewFeatureRequest"
import ThemeController from "@/components/ThemeController";
import { databaseDrizzle } from "@/db";
import { project } from "@/db/schema";
import { getServerSession } from "@/lib/server/session";
import { Author } from "@/type";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";


export default async function page({ params, searchParams }: { params: Promise<{ projectId: string }>, searchParams: Promise<{ theme: string }> }) {
  const [{ projectId }, { theme }, session] = await Promise.all([params, searchParams, getServerSession()])

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

  const projectData = await databaseDrizzle.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: { name: true },
    with: { tags: true },
  });

  if (!projectData) return notFound()

  return (
    <ThemeController theme={theme}>
      <NewFeatureRequest
        projectId={projectId}
        tags={projectData.tags}
        user={user}
      />
    </ThemeController>
  )
}
