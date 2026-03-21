"use client";

import { Authorization, Plan, Feature } from "@/lib/billing/types";
import { createContext, useContext } from "react";

type AuthType = {
  plan: Plan;
  isTrial: boolean;
  limits: Authorization;
  daysLeft: number;
}

type AuthContext = {
  auth: AuthType,
  requireFeature: (feature: Feature, used: number) => boolean
}


const AuthorizationContext = createContext<AuthContext | null>(null);

export function AuthorizationProvider({
  value,
  children,
}: {
  value: AuthType;
  children: React.ReactNode;
}) {

  const requireFeature = (feature: Feature, used: number) => {
    const limit = value.limits[feature];
    if (used >= limit) {
      return false
    }
    return true
  }

  return (
    <AuthorizationContext.Provider
      value={{
        auth: value,
        requireFeature
      }}>
      {children}
    </AuthorizationContext.Provider>
  );
}

export function useAuthorization() {
  const ctx = useContext(AuthorizationContext);
  if (!ctx) throw new Error("Missing AuthorizationProvider");
  return ctx;
}
