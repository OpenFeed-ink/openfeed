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

    return NextResponse.json(config, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { code: "internal_server_error", message: error.message },
      { status: 500 },
    );
  }
}
