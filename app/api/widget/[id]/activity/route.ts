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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
