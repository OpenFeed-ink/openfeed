"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import type { Config } from "@/type"

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

interface ConfigFormProps {
  config: Config
  onChange: (config: Config) => void
}

export function ConfigForm({ config, onChange }: ConfigFormProps) {
  const update = (path: string[], value: any) => {
    const newConfig = { ...config }
    let obj: any = newConfig
    for (let i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]]
    }
    obj[path[path.length - 1]] = value
    onChange(newConfig)
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
            <Select value={config.theme} onValueChange={(v) => update(["theme"], v)}>
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
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={config.projectName}
              onChange={(e) => update(["projectName"], e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="info">Info (optional)</Label>
            <Input
              id="info"
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
            <Select value={config.triggerBtn.position} onValueChange={(v) => update(["triggerBtn", "position"], v)}>
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
                  <Button variant="outline" className="w-10 h-10 p-0">
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
                  <Button variant="outline" className="w-10 h-10 p-0">
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
                onChange={(e) => update(["triggerBtn", "textColor"], e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Variant</Label>
            <Select value={config.triggerBtn.variant} onValueChange={(v) => update(["triggerBtn", "variant"], v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
                <SelectItem value="destructive">Destructive</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Size</Label>
            <Select value={config.triggerBtn.size} onValueChange={(v) => update(["triggerBtn", "size"], v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="xs">XS</SelectItem>
                <SelectItem value="sm">SM</SelectItem>
                <SelectItem value="lg">LG</SelectItem>
                <SelectItem value="icon">Icon</SelectItem>
                <SelectItem value="icon-xs">Icon XS</SelectItem>
                <SelectItem value="icon-sm">Icon SM</SelectItem>
                <SelectItem value="icon-lg">Icon LG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={config.triggerBtn.text || ""}
              onChange={(e) => update(["triggerBtn", "text"], e.target.value)}
              placeholder="Feedback"
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={config.triggerBtn.icon || ""} onValueChange={(v) => update(["triggerBtn", "icon"], v)}>
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
              id="showFeedback"
              checked={config.showFeedback}
              onCheckedChange={(v) => update(["showFeedback"], v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showChangeLog">Changelog</Label>
            <Switch
              id="showChangeLog"
              checked={config.showChangeLog}
              onCheckedChange={(v) => update(["showChangeLog"], v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showRoadmap">Roadmap</Label>
            <Switch
              id="showRoadmap"
              checked={config.showRoadmap}
              onCheckedChange={(v) => update(["showRoadmap"], v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showAnnouncement">Announcement</Label>
            <Switch
              id="showAnnouncement"
              checked={config.showAnnouncement}
              onCheckedChange={(v) => update(["showAnnouncement"], v)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
