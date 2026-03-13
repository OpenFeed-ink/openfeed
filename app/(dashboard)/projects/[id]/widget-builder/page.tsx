import { ConfigForm } from "@/components/ConfigForm/ConfigForm";
import { WidgetPreview } from "@/components/WidgetPreview/WidgetPreview";
import { WidgetBuilderProvider } from "@/contexts/WidgetBuilderProvider";
import { SaveStyleBtn } from "@/components/SaveStyleBtn/SaveStyleBtn";
import type { Config } from "@/type"
import { databaseDrizzle } from "@/db";


interface PageProps {
  params: Promise<{ id: string }>;
}
const defaultConfig:Config = {
    theme: "dark",
    widgetName: "My Awesome Project",
    info: "Share your feedback and ideas",
    triggerBtn: {
      position: "drawer-left",
      color: "#14b8a6",
      textColor: "#ffffff",
      size: "lg",
      text: "Feedback",
      icon: "message-square",
    },
    showFeedback: true,
    showChangeLog: true,
    showRoadmap: true,
  }

export default async function WidgetBuilderPage({ params }: PageProps) {
  const { id } = await params

const conf = await databaseDrizzle.query.widgetConfig.findFirst({
    where: (c, ops)=> ops.eq(c.projectId, id),
  })
  const config:Config = !conf ? defaultConfig: {
    theme: conf.theme,
    widgetName: conf.widgetName,
    info: conf.info,
    triggerBtn: {
      position: conf.triggerBtn_position,
      color: conf.triggerBtn_color,
      textColor:conf.triggerBtn_textColor,
      size: conf.triggerBtn_size,
      text: conf.triggerBtn_text,
      icon: conf.triggerBtn_icon,
    },
    showFeedback: conf.showFeedback,
    showChangeLog: conf.showChangeLog,
    showRoadmap: conf.showRoadmap,
  }

  return (
    <div className="container mx-auto py-6">
      <WidgetBuilderProvider projectId={id} orginalConfig={config}>

        <div className="flex justify-between">
          <h1 className="text-2xl font-bold mb-6">Widget Builder</h1>
          <SaveStyleBtn />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Config Form */}
          <div className="space-y-6">
            <ConfigForm />
          </div>

          {/* Right: Live Preview */}
          <div className="border rounded-lg p-4 bg-muted/30 min-h-screen">
            <h2 className="text-sm font-medium mb-4">Live Preview</h2>
            <WidgetPreview projectId={id} />
          </div>
        </div>
      </WidgetBuilderProvider>
    </div>
  )
}
