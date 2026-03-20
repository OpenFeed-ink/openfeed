import { databaseDrizzle } from "@/db"
import { redirect } from "next/navigation"
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { feature, project, widgetDailyStats } from "@/db/schema"
import { TimeRange } from "@/type"
import { getDateRange, getOverview } from "@/lib/analytics"
import { getServerSession } from "@/lib/server/session"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const OverviewCards = dynamic(() => import("@/components/analytics/OverviewCards").then((m) => m.OverviewCards))
const TopFeaturesChart = dynamic(() => import("@/components/analytics/TopFeaturesChart").then((m) => m.TopFeaturesChart))
const WidgetActivityChart = dynamic(() => import("@/components/analytics/WidgetActivityChart").then((m) => m.WidgetActivityChart))
const ProductAdvisor = dynamic(() => import("@/components/ProductAdvisor/ProductAdvisor").then((m) => m.ProductAdvisor))


export default async function AnalyticsPage({ params, searchParams }: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{
    overviewRange?: TimeRange
    topFeaturesRange?: TimeRange
    widgetRange?: TimeRange
  }>
}) {
  const [{ id }, {
    overviewRange = 'month',
    topFeaturesRange = 'month',
    widgetRange = 'month'
  }] = await Promise.all([params, searchParams])

  const session = await getServerSession()
  if (!session?.user.id) redirect('/signin')

  const topFeaturesStartEnd = getDateRange(topFeaturesRange)
  const widgetStartEnd = getDateRange(widgetRange)

  const [projectData, overviewData] = await Promise.all([
    databaseDrizzle.query.project.findFirst({
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
    }),
    getOverview(id, overviewRange)
  ])
  if (!projectData) notFound()

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Analytics & Insights</h1>
      <div className="space-y-8">
        <Suspense fallback={<Skeleton className="h-30 rounded-xl w-full" />}>
          <OverviewCards initialRange={overviewRange} data={overviewData} />
        </Suspense>
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Product Advisor</h2>
          <Suspense fallback={<Skeleton className="h-120 rounded-xl w-full" />}>
            <ProductAdvisor projectId={id} />
          </Suspense>
        </div>
        <Suspense fallback={<Skeleton className="h-80 rounded-xl w-full" />}>
          <TopFeaturesChart projectId={id} initialRange={topFeaturesRange} data={projectData.features} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-80 rounded-xl w-full" />}>
          <WidgetActivityChart initialRange={widgetRange} data={projectData.widgetDailyStats} />
        </Suspense>
      </div>
    </div>
  )
}
