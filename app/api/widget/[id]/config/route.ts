import { databaseDrizzle } from "@/db";
import type { Config } from "@/type"
import { defaultConfig } from "@/lib/utils";

import { NextRequest, NextResponse } from "next/server";


type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params

    const conf = await databaseDrizzle.query.widgetConfig.findFirst({
      where: (c, ops) => ops.eq(c.projectId, id),
    })
    const config: Config = !conf ? defaultConfig : {
      ...conf,
      announcement: conf.announcement ?? undefined,
    }

    return NextResponse.json(config, {
      status: 200,
      // Read-mostly public config, hit on every widget load across every
      // site embedding it — let it be cached instead of hitting the DB on
      // every single request. A saved config is picked up within a minute.
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
      },
    });

  } catch (error: any) {
    console.error(`[widget config] failed for project ${(await params).id}:`, error);
    return NextResponse.json(
      { code: "internal_server_error", message: "Failed to load widget config" },
      { status: 500 },
    );
  }
}
