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
      theme: conf.theme,
      widgetName: conf.widgetName,
      info: conf.info,
      triggerBtn: {
        position: conf.triggerBtn_position,
        color: conf.triggerBtn_color,
        textColor: conf.triggerBtn_textColor,
        size: conf.triggerBtn_size,
        text: conf.triggerBtn_text,
        icon: conf.triggerBtn_icon,
      },
      showFeedback: conf.showFeedback,
      showChangeLog: conf.showChangeLog,
      showRoadmap: conf.showRoadmap,
    }

    return NextResponse.json(config, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { code: "internal_server_error", message: error.message },
      { status: 500 },
    );
  }
}
