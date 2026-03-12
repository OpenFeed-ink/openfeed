"use client"

import { useState } from "react"
import type { Config } from "@/type"
import { ConfigForm } from "../ConfigForm/ConfigForm"
import { WidgetPreview } from "../WidgetPreview/WidgetPreview"

const defaultConfig: Config = {
  theme: "dark",
  projectName: "My Awesome Project",
  info: "Share your feedback and ideas",
  triggerBtn: {
    position: "drawer-left",
    color: "#14b8a6",
    textColor: "#ffffff",
    variant: "default",
    size: "lg",
    text: "Feedback",
    icon: "message-square",
  },
  showFeedback: true,
  showChangeLog: true,
  showRoadmap: true,
  showAnnouncement: false,
}

export function BuilderLayout() {
  const [config, setConfig] = useState<Config>(defaultConfig)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Config Form */}
      <div className="space-y-6">
        <ConfigForm config={config} onChange={setConfig} />
      </div>

      {/* Right: Live Preview */}
      <div className="border rounded-lg p-4 bg-muted/30 min-h-screen">
        <h2 className="text-sm font-medium mb-4">Live Preview</h2>
          <WidgetPreview config={config} />
      </div>
    </div>
  )
}
