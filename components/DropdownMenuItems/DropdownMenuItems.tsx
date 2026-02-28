"use client"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { DropdownMenuItem } from "../ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation";


export function ModeToggleDropdownMenuItem() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenuItem onClick={() => setTheme(curr => curr === "dark" ? "light" : "dark")}>
      <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      Toggle theme
    </DropdownMenuItem>
  )
}

export function LogOutDropdownMenuItem() {
  const router = useRouter()
  const logout = async () => {
    const { error } = await authClient.signOut()
    if (error) {
      toast.error(error.message ?? "Failed to Log out, please try again")
    }
    return router.replace("/signin")
  }

  return (<DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
    <LogOut className="mr-2 h-4 w-4" />
    Log out
  </DropdownMenuItem>)
}
