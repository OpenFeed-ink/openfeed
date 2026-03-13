"use client"
import { Button } from "@/components/ui/button"
import { useWidgetBuilder } from "@/contexts/WidgetBuilderProvider"
import { Brush, Loader2 } from "lucide-react"

export const SaveStyleBtn = () => {
  const { saveConfig, pending } = useWidgetBuilder()
  return (
    <Button size='lg' onClick={saveConfig} className="cursor-pointer">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          saving style...
        </>
      ) : (
        <>
          <Brush />
          Save Style
        </>
      )}
    </Button>
  )
}
