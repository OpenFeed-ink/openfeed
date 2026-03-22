import { notFound, redirect } from "next/navigation";
import { databaseDrizzle } from "@/db";
import { TeamMembers } from "@/components/TeamMmbers/TeamMembers";
import { InviteForm } from "@/components/InviteForm/InviteForm";
import { getServerSession } from "@/lib/server/session";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamPage({ params }: PageProps) {
  const [{ id: projectId }, session] = await Promise.all([params, getServerSession()]);
  if (!session?.user.id) redirect("/signin");

  const projectMemeber = await databaseDrizzle.query.project.findFirst({
    where: (p, ops) => ops.eq(p.id, projectId),
    columns: {
      ownerId: true,
    },
    with: {
      usersProjects: {
        columns: {
          role: true
        },
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        }
      },
    },
  });

  if (!projectMemeber) return notFound()

  const role = projectMemeber.ownerId === session.user.id ? "OWNER" : projectMemeber.usersProjects.find(up => up.user.id === session.user.id)?.role
  if (!role) return notFound()

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
            projectId={projectId}
            projectMemeber={projectMemeber}
            userRole={role}
            currentUserId={session.user.id}
          />
        </div>

        {/* Invite form (only for admins) */}
        <div>
          <InviteForm projectId={projectId} currentMemeberCount={projectMemeber.usersProjects.length} />
        </div>
      </div>
    </div>
  );
}
