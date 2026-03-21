"use client";

import { createContext, useContext } from "react";
import type { Permission } from "@/lib/permission/types";

const ProjectPermissionContext = createContext<Permission | null>(null);

export function ProjectPermissionProvider({
  value,
  children,
}: {
  value: Permission;
  children: React.ReactNode;
}) {
  return (
    <ProjectPermissionContext.Provider value={value}>
      {children}
    </ProjectPermissionContext.Provider>
  );
}

export function useProjectPermission() {
  const ctx = useContext(ProjectPermissionContext);
  if (!ctx) {
    throw new Error("useProjectPermission must be used inside provider");
  }
  return ctx;
}
