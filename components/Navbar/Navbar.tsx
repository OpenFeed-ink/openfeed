import * as motion from "motion/react-client";
import { Logo } from "@/components/Logo";
import { UserMenu } from "../userMenu/UserMenu";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"


export function Navbar(user: { name: string, email: string, image?: string }) {

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and primary navigation */}
        <div className="flex items-center gap-8">
          <Logo withName />
        </div>

        {/* User menu */}
        <UserMenu user={user} >
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-100">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </UserMenu>
      </div>
    </motion.nav>
  );
}
