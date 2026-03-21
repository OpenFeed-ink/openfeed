"use client";

import { useAuthorization } from "@/contexts/AuthorizationProvider"

export const UserPlan = ({ userName, userEmail }: { userName: string, userEmail: string }) => {
  const { auth: { plan } } = useAuthorization()
  return (
    <div className="flex flex-col space-y-1">
      <p className="text-sm font-medium leading-none">
        {userName}
        {plan && plan !== 'FREE' && (
          <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
            ({plan.charAt(0) + plan.slice(1).toLowerCase()})
          </span>
        )}
        {plan === 'FREE' && (
          <span className="ml-2 text-xs text-muted-foreground">(Free)</span>
        )}
      </p>
      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
    </div>
  )
}
