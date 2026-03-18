import { databaseDrizzle } from "@/db";
import { changelogs, feature, widgetDailyStats } from "@/db/schema";
import { TimeRange } from "@/type";
import { sql } from "drizzle-orm";

export function getDateRange(range: TimeRange): { startDate: Date; endDate: Date } {
  const now = new Date()
  const endDate = new Date(now)
  let startDate = new Date(now)
  switch (range) {
    case 'today':
      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setDate(now.getDate() - 30)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case 'all':
      startDate = new Date(0)
      break
  }
  return { startDate, endDate }
}

export async function getOverview(id: string, overviewRange: TimeRange) {
  const overviewStartEnd = getDateRange(overviewRange)

  const overview = await databaseDrizzle.execute(sql`
  SELECT
    (SELECT COUNT(*) FROM ${feature}
      WHERE ${feature.projectId} = ${id}
      AND ${feature.createdAt} BETWEEN ${overviewStartEnd.startDate.toISOString()} AND ${overviewStartEnd.endDate.toISOString()}
    ) AS "totalFeedback",
    (SELECT COALESCE(SUM(${feature.upvotesCount}), 0) FROM ${feature}
      WHERE ${feature.projectId} = ${id}
      AND ${feature.createdAt} BETWEEN ${overviewStartEnd.startDate.toISOString()} AND ${overviewStartEnd.endDate.toISOString()}
    ) AS "totalUpvotes",
    (SELECT COUNT(*) FROM ${changelogs}
      WHERE ${changelogs.projectId} = ${id}
      AND ${changelogs.createdAt} BETWEEN ${overviewStartEnd.startDate.toISOString()} AND ${overviewStartEnd.endDate.toISOString()}
    ) AS "totalChangelogEntries",
    (SELECT COALESCE(SUM(${widgetDailyStats.opens}), 0) FROM ${widgetDailyStats}
      WHERE ${widgetDailyStats.projectId} = ${id}
      AND ${widgetDailyStats.date} BETWEEN ${overviewStartEnd.startDate.toISOString()} AND ${overviewStartEnd.endDate.toISOString()}
    ) AS "widgetOpensThisPeriod"
`)

  return {
    totalFeedback: overview[0].totalFeedback || 0 as number,
    totalUpvotes: overview[0].totalUpvotes || 0 as number,
    totalChangelogEntries: overview[0].totalChangelogEntries || 0 as number,
    widgetOpensThisPeriod: overview[0].widgetOpensThisPeriod || 0 as number,
  }

}
