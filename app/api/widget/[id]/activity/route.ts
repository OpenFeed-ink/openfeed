import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "drizzle-orm"
import { databaseDrizzle } from "@/db";
import { widgetDailyStats } from "@/db/schema";


type Params = {
  params: {
    id: string
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const projectId = params.id

    // ===== 1. Validate cookie =====
    const cookieStore = await cookies()
    const visitorToken = cookieStore.get("visitor_token")?.value

    if (!visitorToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ===== 2. Basic bot filter =====
    const ua = req.headers.get("user-agent") || ""
    if (!ua || ua.length < 10) {
      return NextResponse.json({ error: "Blocked" }, { status: 403 })
    }

    // ===== 3. Rate limit =====
    if (isRateLimited(visitorToken)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    // ===== 4. Deduplication =====
    if (isDuplicate(visitorToken, projectId)) {
      return NextResponse.json({ ok: true }) // silently ignore
    }

    // ===== 5. Validate project =====
    const existingProject = await databaseDrizzle.query.project.findFirst({
      where: (p, ops) => ops.eq(p.id, projectId),
      columns: { id: true },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // ===== 6. Normalize date (UTC day) =====
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // ===== 7. Atomic upsert (increment opens) =====
    await databaseDrizzle
      .insert(widgetDailyStats)
      .values({
        projectId,
        date: today,
        opens: 1,
      })
      .onConflictDoUpdate({
        target: [widgetDailyStats.projectId, widgetDailyStats.date],
        set: {
          opens: sql`${widgetDailyStats.opens} + 1`,
        },
      })

    return NextResponse.json({ ok: true })

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

const rateLimitMap = new Map<string, { count: number; last: number }>()
const dedupMap = new Map<string, number>()

// ---- Rate limit (burst control)
function isRateLimited(token: string) {
  const now = Date.now()
  const entry = rateLimitMap.get(token)

  if (!entry) {
    rateLimitMap.set(token, { count: 1, last: now })
    return false
  }

  const diff = now - entry.last

  // reset window after 10s
  if (diff > 10000) {
    rateLimitMap.set(token, { count: 1, last: now })
    return false
  }

  entry.count++
  entry.last = now

  // allow max 3 requests per 10s
  return entry.count > 3
}

// ---- Dedup (ignore repeated opens)
function isDuplicate(token: string, projectId: string) {
  const key = `${projectId}:${token}`
  const now = Date.now()
  const last = dedupMap.get(key) || 0

  if (now - last < 10000) return true // 10 sec window

  dedupMap.set(key, now)
  return false
}

// ---- Cleanup memory (avoid leaks)
setInterval(() => {
  const now = Date.now()

  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.last > 60000) {
      rateLimitMap.delete(key)
    }
  }

  for (const [key, value] of dedupMap.entries()) {
    if (now - value > 60000) {
      dedupMap.delete(key)
    }
  }
}, 60000)
