import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { databaseDrizzle } from "@/db";
import { usersProjects } from "@/db/schema";
import { TeamMembers } from "@/components/TeamMmbers/TeamMembers";
import { InviteForm } from "@/components/InviteForm/InviteForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: PageProps) {
  const { id: projectId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/signin");

  const members = await databaseDrizzle.query.usersProjects.findMany({
    where: eq(usersProjects.projectId, projectId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (members.length === 0) {
    return notFound();
  }
  const currentUserMembership = members.find(m => m.userId === session.user.id);
  if (!currentUserMembership) {
    return redirect("/");
  }

  const isAdmin = currentUserMembership.role === "ADMIN";

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground">
          Manage members and invite new teammates
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Member list */}
        <div className="md:col-span-2">
          <TeamMembers
            members={members}
            currentUserId={session.user.id}
            isAdmin={isAdmin}
            projectId={projectId}
          />
        </div>

        {/* Invite form (only for admins) */}
        {isAdmin && (
          <div>
            <InviteForm projectId={projectId} />
          </div>
        )}
      </div>
    </div>
  );
}
