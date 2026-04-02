import { Logo } from "@/components/Logo";
import { UserMenu } from "../userMenu/UserMenu";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { User } from "better-auth";

export function Navbar({ user }: { user: User }) {

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and primary navigation */}
        <div className="flex items-center gap-8">
          <Logo withName />
        </div>

        {/* User menu */}
        <UserMenu user={user} >
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </UserMenu>
      </div>
    </nav>
  );
}
