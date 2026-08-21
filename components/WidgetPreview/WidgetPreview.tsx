"use client"

import { useWidgetBuilder } from "@/contexts/WidgetBuilderProvider"
import { useMemo } from "react"
import { useDebounce } from "use-debounce"


export function WidgetPreview({projectId}:{projectId:string}) {
  const { config } = useWidgetBuilder()
  // config changes on every keystroke/color-picker drag in ConfigForm. Since
  // iframeSrc feeds the iframe's src attribute directly, updating it that
  // often forced a full reload (fresh navigation + JS re-execution) per
  // character typed. Debounce so the preview only reloads once typing pauses.
  const [debouncedConfig] = useDebounce(config, 400)

  const iframeSrc = useMemo(() => {
    const encoded = encodeURIComponent(JSON.stringify({...debouncedConfig, projectId}))
    return `/widget-preview?config=${encoded}`
  }, [debouncedConfig, projectId])

  return (
    <iframe
      src={iframeSrc}
      className="w-full h-[97%] border-0"
      title="Widget Preview"
    />
  )
}
