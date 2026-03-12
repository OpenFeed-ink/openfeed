"use client"

import { useMemo } from "react"
import type { Config } from "@/type"

interface WidgetPreviewProps {
  config: Config
}

export function WidgetPreview({ config }: WidgetPreviewProps) {
  const iframeSrc = useMemo(() => {
    const encoded = encodeURIComponent(JSON.stringify(config))
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
