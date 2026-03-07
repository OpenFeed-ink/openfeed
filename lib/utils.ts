import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value)
}

type Membership = {
  userId: string;
  role: "ADMIN" | "MEMBER";

}

const primission = {
  "ADMIN": {
    role: "admin",
    billing: true,
    deleteProject: true,
    upsertFeature: true,
    deleteAnyFeature: true,
    addComment: true,
    deleteComment: true,
    canPin:true
  },
  "MEMBER": {
    role: "member",
    billing: false,
    deleteProject: false,
    upsertFeature: true,
    deleteAnyFeature: true,
    addComment: true,
    deleteComment: true,
    canPin: true,
  },
  "ANONYMOUS": {
    role: "anonymous",
    billing: false,
    deleteProject: false,
    upsertFeature: true,
    deleteAnyFeature: false,
    addComment: true,
    deleteComment: false,
    canPin: false
  },
}

export function permission(memberships: Membership[], userId: string) {
  const membership = memberships.find(m => m.userId === userId)
  if (!membership) {
    return primission['ANONYMOUS']
  }

  return primission[membership.role]
}
