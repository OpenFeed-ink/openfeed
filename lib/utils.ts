import { clsx, type ClassValue } from "clsx"
import { Config} from "@/type"
import { twMerge } from "tailwind-merge"

/**
 * Whether a post-auth redirect target is safe to send the browser to: a
 * same-origin relative path. Rejects protocol-relative ("//evil.com") and
 * absolute ("https://evil.com") URLs, which a `callbackUrl` query param
 * would otherwise let an attacker control.
 */
export function isSafeRedirectPath(path: string | undefined | null): path is string {
  if (!path) return false
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://")
}

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
