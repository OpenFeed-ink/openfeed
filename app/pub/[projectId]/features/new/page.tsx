import { NewFeatureRequest } from "@/components/NewFeatureRequest/NewFeatureRequest"
import ThemeController from "@/components/ThemeController";
import { databaseDrizzle } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";


export default async function page({ params, searchParams }: { params: Promise<{ projectId: string }>, searchParams: Promise<{ theme: string }> }) {
  const { projectId } = await params
  const { theme } = await searchParams
  const cookieStore = await cookies()

  const visitorToken = cookieStore.get("visitor_token")?.value

  const projectData = await databaseDrizzle.query.project.findFirst({
    where: eq(project.id, projectId),
    columns: { name: true },
    with: { tags: true },
  });

  if (!projectData || !visitorToken) return notFound()

  const visitorUser = {
    id: visitorToken,
    email: "visitor@openfeed.ink",
    name: `User-${visitorToken.slice(0, 4).toUpperCase()}`,
    image: null
  }

  return (
    <ThemeController theme={theme}>
      <NewFeatureRequest
        projectId={projectId}
        tags={projectData.tags}
        user={visitorUser}
      />
    </ThemeController>
  )
}
