import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RemoveMembers } from "../RemoveMembers/RemoveMembers";

interface Member {
  userId: string;
  role: "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface TeamMembersProps {
  members: Member[];
  currentUserId: string;
  isAdmin: boolean;
  projectId: string;
}

export function TeamMembers({ members, currentUserId, isAdmin, projectId }: TeamMembersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              {isAdmin && <TableHead className="w-25">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isCurrentUser = member.userId === currentUserId;
              const canRemove = isAdmin && member.role !== "ADMIN" && !isCurrentUser;

              return (
                <TableRow key={member.userId}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.image ?? undefined} />
                      <AvatarFallback>
                        {member.user.name?.charAt(0) || member.user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.user.name || "Unnamed"}</div>
                      <div className="text-sm text-muted-foreground">{member.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={member.role === "ADMIN" ? "default" : "outline"}
                      className={member.role === "ADMIN" ? "bg-emerald-600 capitalize" : "capitalize"}
                    >
                      {member.role.toLowerCase()}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {canRemove && (
                        <RemoveMembers
                          projectId={projectId}
                          userId={member.userId}
                          userName={member.user.name || member.user.email}
                        />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
