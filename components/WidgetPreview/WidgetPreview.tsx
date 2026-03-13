"use client"

import { useWidgetBuilder } from "@/contexts/WidgetBuilderProvider"
import { useMemo } from "react"


export function WidgetPreview({projectId}:{projectId:string}) {
  const { config } = useWidgetBuilder()
  const iframeSrc = useMemo(() => {
    const encoded = encodeURIComponent(JSON.stringify({...config, projectId}))
    return `/widget-preview?config=${encoded}`
  }, [config])

  return (
    <iframe
      src={iframeSrc}
      className="w-full h-[97%] border-0"
      title="Widget Preview"
    />
  )
}
