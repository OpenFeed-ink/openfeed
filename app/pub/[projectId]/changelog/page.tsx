import { ChangelogList } from "@/components/ChangelogList/ChangelogList"
import ThemeController from "@/components/ThemeController"
import { databaseDrizzle } from "@/db"

export default async function page({ params, searchParams }: { params: Promise<{ projectId: string }>, searchParams: Promise<{ theme: string }> }) {
  const { projectId } = await params
  const { theme } = await searchParams


  const logs = await databaseDrizzle.query.changelogs.findMany({
    where: (c, ops) => ops.eq(c.projectId, projectId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
        with: {
          usersProjects: {
            where: (p, ops) => ops.eq(p.projectId, projectId),
            columns: {
              role: true,
            }
          }
        }
      }
    }
  })

  return (
    <ThemeController theme={theme}>
      <div className="w-full min-h-screen overflow-y-auto">
        <div className="space-y-4 py-2 w-full max-w-3xl mx-auto">
          <ChangelogList
            entries={logs}
            userId=""
          />
        </div>
      </div>
    </ThemeController>
  )
}
