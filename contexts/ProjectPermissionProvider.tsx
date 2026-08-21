"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import type { Permission } from "@/lib/permission/types";
import { Membership } from "@/type";
import { PERMISSIONS } from "@/lib/permission/config";

type userPermission = {
  getUserRole: (userId: string) => Membership,
  getPermission: () => Permission
}

const ProjectPermissionContext = createContext<userPermission | null>(null);

export function ProjectPermissionProvider({
  children,
  memeberships,
  userId,
}: {
  userId: string
  memeberships: Membership[];
  children: React.ReactNode;
}) {

  const getUserRole = useCallback(
    (targetUserId: string) => memeberships.find(f => f.userId === targetUserId) ?? { userId: targetUserId, role: "ANONYMOUS" as const },
    [memeberships],
  );

  const getPermission = useCallback(() => {
    const { role } = getUserRole(userId)
    return PERMISSIONS[role]
  }, [getUserRole, userId])

  const contextValue = useMemo(
    () => ({ getUserRole, getPermission }),
    [getUserRole, getPermission]
  )

  return (
    <ProjectPermissionContext.Provider value={contextValue}>
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
