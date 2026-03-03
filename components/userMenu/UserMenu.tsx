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

export const UserMenu = ({ user, isSidebarMobile, children }: { isSidebarMobile?: boolean, user: { name: string, email: string, image?: string }, children: ReactNode }) => {


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side={isSidebarMobile === undefined ? undefined : isSidebarMobile ? "bottom" : "right"} className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
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
