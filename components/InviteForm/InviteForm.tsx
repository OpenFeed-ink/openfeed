"use client";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail } from "lucide-react";
import { inviteMemberAction } from "@/actions/teams";
import { useProjectPermission } from "@/contexts/ProjectPermissionProvider";
import { useAuthorization } from "@/contexts/AuthorizationProvider";
import Link from "next/link"

interface InviteFormProps {
  projectId: string;
  currentMemeberCount: number
}

export function InviteForm({ projectId, currentMemeberCount }: InviteFormProps) {
  const [isPending, startTransition] = useTransition();
  const { getPermission } = useProjectPermission()
  const { requireFeature } = useAuthorization()
  const canInvite = requireFeature('teamInvite', currentMemeberCount)
  const permit = getPermission()


  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const handleSubmit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("email", email);
      formData.append("role", role);
      const { status, message } = await inviteMemberAction(formData);
      if (status === 'ERROR') {
        toast.error(message || "Failed to send invitation");
        return
      }

      if (status === 'SUCCESS') {
        toast.success(message || "Invitation sent!");
        return;
      }

      setEmail("");
      setRole("MEMBER");
    });
  };

  if (!permit.inviteMember) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Member</CardTitle>
        <CardDescription>
          Send an email invitation to join this project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canInvite ? <Button
            type="submit"
            className="w-full hover:bg-emerald-700"
            disabled={isPending}
            onClick={handleSubmit}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button> : <p className="text-sm text-muted-foreground w-full text-left">
            Member limit reached.{" "}
            <Button variant="link" className="p-0 h-auto text-emerald-600" asChild>
              <Link href="/billing">Upgrade your plan</Link>
            </Button>
          </p>}
        </form>
      </CardContent>
    </Card>
  );
}
