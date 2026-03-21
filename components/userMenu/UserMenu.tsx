"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOutDropdownMenuItem, ModeToggleDropdownMenuItem } from "../DropdownMenuItems/DropdownMenuItems";
import { BadgeCheckIcon, BellIcon, CreditCardIcon, SparklesIcon } from "lucide-react";
import { ReactNode } from "react";
import { User } from "better-auth";
import { UserPlan } from "../UserPlan/UserPlan";

export const UserMenu = ({ user, isSidebarMobile, children }: { isSidebarMobile?: boolean, user: User, children: ReactNode }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side={isSidebarMobile === undefined ? undefined : isSidebarMobile ? "bottom" : "right"} className="w-56">
        <DropdownMenuLabel>
          <UserPlan userName={user.name} userEmail={user.email} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <SparklesIcon
            />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheckIcon
            />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCardIcon
            />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon
            />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <ModeToggleDropdownMenuItem />
        <DropdownMenuSeparator />
        <LogOutDropdownMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
