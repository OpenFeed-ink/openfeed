"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"


export const LogoutBtn = ({redirect = "/signin"}:{redirect?:string}) => {
  const router = useRouter()

  const logout = async () => {
    const { error } = await authClient.signOut()
    if (error) {
      toast.error(error.message ?? "Failed to Log out, please try again")
    }
    return router.replace(redirect)
  }
  return (
    <Button onClick={logout} variant='destructive' size='lg'>
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  )
}

// export function LogOutDropdownMenuItem() {
//   const router = useRouter()
//   const logout = async () => {
//     const { error } = await authClient.signOut()
//     if (error) {
//       toast.error(error.message ?? "Failed to Log out, please try again")
//     }
//     return router.replace("/signin")
//   }

//   return (<DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
//     <LogOut className="mr-2 h-4 w-4" />
//     Log out
//   </DropdownMenuItem>)
// }
