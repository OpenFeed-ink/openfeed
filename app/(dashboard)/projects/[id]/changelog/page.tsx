import { ChangelogList } from "@/components/ChangelogList/ChangelogList"
import { UpsertChangelog } from "@/components/UpsertChangelog/UpsertChangelog"
import { databaseDrizzle } from "@/db"
import { permission } from "@/lib/utils"
import { redirect } from 'next/navigation'
import { getServerSession } from "@/lib/server/session"


export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session] = await Promise.all([params, getServerSession()])
  if (!session?.user.id) return redirect("/signin");

  const [logs, memberships] = await Promise.all([
    databaseDrizzle.query.changelogs.findMany({
      where: (c, ops) => ops.eq(c.projectId, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
          with: {
            usersProjects: {
              where: (p, ops) => ops.eq(p.projectId, id),
              columns: {
                role: true,
              }
            }
          }
        }
      }
    }),
    databaseDrizzle.query.usersProjects.findMany({
      where: (c, ops) => ops.eq(c.projectId, id),
      columns: { userId: true, role: true },
    })
  ])

  const permit = permission(memberships, session.user.id)


  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Changelog</h1>
            <p className="text-sm text-muted-foreground">
              Keep your users informed about updates
            </p>
          </div>
          {permit.addNewChagelog && <UpsertChangelog projectId={id} />}
        </div>
        <ChangelogList
          entries={logs}
          canEdit={permit.editChagelog}
          canDelete={permit.deleteChangelog}
          userId={session.user.id}
        />
      </div>
    </div>
  )
}
