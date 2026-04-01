import { Logo } from "@/components/Logo";
import { UserMenu } from "../userMenu/UserMenu";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { User } from "better-auth";
import Link from "next/link"

export function Navbar({ user }: { user?: User }) {


  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Logo withName />
        </div>
        <Link href={"/terms_of_service_and_privacy_policy"}>
          Terms of Service
        </Link>
        {!user ? (
          <div className="flex items-center gap-4">
            {/* GitHub stars badge */}
            <Link
              href="https://github.com/openfeed-ink/openfeed"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block"
            >
              <img
                src="https://img.shields.io/github/stars/openfeed-ink/openfeed?style=social"
                alt="GitHub stars"
                className="h-6"
              />
            </Link>

            {/* Start free button */}
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              asChild
            >
              <Link href={"/signup"}>
                Start free →
              </Link>
            </Button>
          </div>
        ) : (
          <UserMenu user={user}>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </UserMenu>
        )}
      </div>
    </nav>
  );
}
