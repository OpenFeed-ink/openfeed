import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "drizzle-orm"
import { databaseDrizzle } from "@/db";
import { widgetDailyStats } from "@/db/schema";
import redis from "@/lib/server/redis";


type Params = {
  params: Promise<{
    id: string
  }>
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params

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

    // ===== 2b. Rate limit by IP =====
    // visitor_token is just an anti-double-count cookie, not a credential —
    // a caller can mint a fresh one on every request and walk straight past
    // the per-token dedup below. This is the actual backstop against a
    // script hammering this endpoint with random tokens to inflate a
    // project's stats: generous enough for real traffic (many visitors can
    // share one IP behind a NAT/proxy), tight enough to block a spam script.
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown"
    const rateLimitKey = `activity_rl:${ip}`
    const requestCount = await redis.incr(rateLimitKey)
    if (requestCount === 1) {
      await redis.expire(rateLimitKey, 60)
    }
    if (requestCount > 60) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    // ===== 3. Deduplication =====
    const key = `open:${id}:${visitorToken}`
    const isNew = await redis.set(key, "1", 'EX', 300, 'NX')
    if (!isNew) {
      return NextResponse.json({ ok: true, skipped: true })
    }

    // ===== 4. Validate project =====
    const existingProject = await databaseDrizzle.query.project.findFirst({
      where: (p, ops) => ops.eq(p.id, id),
      columns: { id: true },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // ===== 5. Normalize date (UTC day) =====
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // ===== 6. Atomic upsert (increment opens) =====
    await databaseDrizzle
      .insert(widgetDailyStats)
      .values({
        projectId: id,
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
    console.error("[widget activity] failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
