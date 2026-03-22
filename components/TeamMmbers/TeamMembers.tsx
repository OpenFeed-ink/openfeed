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

type ProjectMemeber = {
  ownerId: string;
  usersProjects: {
    role: "ADMIN" | "MEMBER";
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }[];
}

interface TeamMembersProps {
  projectMemeber: ProjectMemeber;
  projectId: string;
  userRole: "ADMIN" | "MEMBER" | "OWNER";
  currentUserId: string
}

export function TeamMembers({ projectId, projectMemeber, userRole, currentUserId }: TeamMembersProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members ({projectMemeber.usersProjects.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              {userRole !== 'MEMBER' && <TableHead className="w-25">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectMemeber.usersProjects.map((member) => {
              const isCurrentUser = member.user.id === currentUserId;
              const canRemove = (member.role !== "ADMIN" && !isCurrentUser) || (userRole === 'OWNER' && !isCurrentUser);
              const isOwner = projectMemeber.ownerId === member.user.id
              return (
                <TableRow key={member.user.id}>
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
                      className={isOwner ? "bg-emerald-600 capitalize" : member.role === "ADMIN" ? "bg-emerald-200 capitalize" : "capitalize"}
                    >
                      {isOwner ? "owner" : member.role.toLowerCase()}
                    </Badge>
                  </TableCell>
                  {userRole !== 'MEMBER' && (
                    <TableCell>
                      {canRemove && (
                        <RemoveMembers
                          projectId={projectId}
                          userId={member.user.id}
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
