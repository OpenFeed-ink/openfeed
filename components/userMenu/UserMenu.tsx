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
import { CreditCardIcon, SparklesIcon } from "lucide-react";
import { ReactNode } from "react";
import { User } from "better-auth";
import { UserPlan } from "../UserPlan/UserPlan";
import Link from "next/link"

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
          <DropdownMenuItem asChild>
            <Link href={"/pricing"}>
              <SparklesIcon />
              Upgrade to Pro
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={process.env.NEXT_PUBLIC_PADDLE_CUSTOMER_PORTAL_URL}>
              <CreditCardIcon />
              Billing
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <ModeToggleDropdownMenuItem />
        <DropdownMenuSeparator />
        <LogOutDropdownMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
