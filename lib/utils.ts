import { clsx, type ClassValue } from "clsx"
import { Config} from "@/type"
import { twMerge } from "tailwind-merge"

export const defaultConfig: Config = {
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

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value)
}
