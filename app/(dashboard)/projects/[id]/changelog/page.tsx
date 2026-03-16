import { ChangelogList } from "@/components/ChangelogList/ChangelogList"
import { UpsertChangelog } from "@/components/UpsertChangelog/UpsertChangelog"
import { databaseDrizzle } from "@/db"

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const logs = await databaseDrizzle.query.changelogs.findMany({
    where: (c, ops) => ops.eq(c.projectId, id)
  })

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
          <UpsertChangelog projectId={id} />
        </div>

        <ChangelogList entries={logs} />
      </div>
    </div>
  )
}
