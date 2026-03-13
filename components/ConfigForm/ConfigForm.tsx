"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useWidgetBuilder } from "@/contexts/WidgetBuilderProvider"

export const AVAILABLE_ICONS = [
  "message-square",
  "bell",
  "github",
  "twitter",
  "mail",
  "heart",
  "star",
  "thumbs-up",
]


export function ConfigForm() {
  const { setConfig, config, pending } = useWidgetBuilder()

  const update = (path: string[], value: any) => {
    const newConfig = { ...config }
    let obj: any = newConfig
    for (let i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]]
    }
    obj[path[path.length - 1]] = value
    setConfig(newConfig)
  }

  const toggleTab = (key: "showFeedback" | "showChangeLog" | "showRoadmap", value: boolean) => {
    const next = {
      showFeedback: config.showFeedback,
      showChangeLog: config.showChangeLog,
      showRoadmap: config.showRoadmap,
      [key]: value,
    }

    const enabledCount = Object.values(next).filter(Boolean).length

    // prevent disabling the last enabled tab
    if (enabledCount === 0) return

    update([key], value)
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={config.theme} disabled={pending} onValueChange={(v) => update(["theme"], v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="widgetName">Widget Name</Label>
            <Input
              id="widgetName"
              disabled={pending}
              value={config.widgetName}
              onChange={(e) => update(["widgetName"], e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="info">Info (optional)</Label>
            <Input
              id="info"
              disabled={pending}
              value={config.info || ""}
              onChange={(e) => update(["info"], e.target.value)}
              placeholder="Short description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger Button */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger Button</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <Select value={config.triggerBtn.position} disabled={pending} onValueChange={(v) => update(["triggerBtn", "position"], v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="float-bottom-right">Float Bottom Right</SelectItem>
                <SelectItem value="float-bottom-left">Float Bottom Left</SelectItem>
                <SelectItem value="float-up-right">Float Top Right</SelectItem>
                <SelectItem value="float-up-left">Float Top Left</SelectItem>
                <SelectItem value="drawer-left">Drawer Left</SelectItem>
                <SelectItem value="drawer-right">Drawer Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Button Color</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-10 h-10 p-0" disabled={pending}>
                    <div className="w-full h-full rounded" style={{ backgroundColor: config.triggerBtn.color }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker
                    color={config.triggerBtn.color}
                    onChange={(color) => update(["triggerBtn", "color"], color)}
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={config.triggerBtn.color}
                disabled={pending}
                onChange={(e) => update(["triggerBtn", "color"], e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={pending} className="w-10 h-10 p-0">
                    <div className="w-full h-full rounded" style={{ backgroundColor: config.triggerBtn.textColor }} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <HexColorPicker
                    color={config.triggerBtn.textColor}
                    onChange={(color) => update(["triggerBtn", "textColor"], color)}
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={config.triggerBtn.textColor}
                disabled={pending}
                onChange={(e) => update(["triggerBtn", "textColor"], e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Size</Label>
            <Select value={config.triggerBtn.size} disabled={pending} onValueChange={(v) => update(["triggerBtn", "size"], v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="xs">XS</SelectItem>
                <SelectItem value="sm">SM</SelectItem>
                <SelectItem value="lg">LG</SelectItem>
                <SelectItem value="icon">Icon</SelectItem>
                <SelectItem value="icon-xs">Icon only XS</SelectItem>
                <SelectItem value="icon-sm">Icon only SM</SelectItem>
                <SelectItem value="icon-lg">Icon only LG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={config.triggerBtn.text || ""}
              disabled={pending}
              onChange={(e) => update(["triggerBtn", "text"], e.target.value)}
              placeholder="Feedback"
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={config.triggerBtn.icon || ""} disabled={pending} onValueChange={(v) => update(["triggerBtn", "icon"], v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {AVAILABLE_ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    {icon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Tabs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="showFeedback">Feedback</Label>
            <Switch
              disabled={pending}
              id="showFeedback"
              checked={config.showFeedback}
              onCheckedChange={(v) => toggleTab("showFeedback", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showChangeLog">Changelog</Label>
            <Switch
              disabled={pending}
              id="showChangeLog"
              checked={config.showChangeLog}
              onCheckedChange={(v) => toggleTab("showChangeLog", v)}

            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showRoadmap">Roadmap</Label>
            <Switch
              disabled={pending}
              id="showRoadmap"
              checked={config.showRoadmap}
              onCheckedChange={(v) => toggleTab("showRoadmap", v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
