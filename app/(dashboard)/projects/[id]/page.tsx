import { databaseDrizzle } from "@/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { feature, project, widgetDailyStats } from "@/db/schema"
import { TimeRange } from "@/type"
import { getDateRange, getOverview } from "@/lib/analytics"
import { OverviewCards } from "@/components/analytics/OverviewCards"
import { TopFeaturesChart } from "@/components/analytics/TopFeaturesChart"
import { WidgetActivityChart } from "@/components/analytics/WidgetActivityChart"
import { AIAssistant } from "@/components/analytics/AIAssistant"


export default async function AnalyticsPage({ params, searchParams }: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{
    overviewRange?: TimeRange
    topFeaturesRange?: TimeRange
    widgetRange?: TimeRange
  }>
}) {
  const { id } = await params
  const {
    overviewRange = 'month',
    topFeaturesRange = 'month',
    widgetRange = 'month'
  } = await searchParams

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user.id) redirect('/signin')

  const topFeaturesStartEnd = getDateRange(topFeaturesRange)
  const widgetStartEnd = getDateRange(widgetRange)

  const projectData = await databaseDrizzle.query.project.findFirst({
    where: eq(project.id, id),
    columns: { id: true },
    with: {
      features: {
        where: (f, ops) => ops.and(
          ops.gte(f.createdAt, topFeaturesStartEnd.startDate),
          ops.lte(f.createdAt, topFeaturesStartEnd.endDate),
          ops.gte(f.upvotesCount, 1)
        ),
        orderBy: desc(feature.upvotesCount),
        limit: 10,
        columns: { id: true, title: true, upvotesCount: true }
      },
      widgetDailyStats: {
        where: (w, ops) => ops.and(
          ops.gte(w.date, widgetStartEnd.startDate),
          ops.lte(w.date, widgetStartEnd.endDate)
        ),
        orderBy: desc(widgetDailyStats.date),
        columns: { date: true, opens: true }
      }
    }
  })
  if (!projectData) notFound()

  const overviewData = await getOverview(id, overviewRange)

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Analytics & Insights</h1>
      <div className="space-y-8">
        <OverviewCards initialRange={overviewRange} data={overviewData} />
        <AIAssistant projectId={id} />
        <TopFeaturesChart projectId={id} initialRange={topFeaturesRange} data={projectData.features} />
        <WidgetActivityChart initialRange={widgetRange} data={projectData.widgetDailyStats} />
      </div>
    </div>
  )
}
