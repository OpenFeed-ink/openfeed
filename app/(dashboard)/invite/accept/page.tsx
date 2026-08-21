import { eq, and, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { databaseDrizzle } from "@/db";
import { invitation, usersProjects } from "@/db/schema";
import { LogoutBtn } from "@/components/LogoutBtn/LogoutBtn";
import { getServerSession } from "@/lib/server/session";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams;
  if (!token) {
    return <InvalidInvite title="Invalid Invitation" action="home" message="No invitation token provided." />;
  }

  const session = await getServerSession();
  if (!session?.user.id) {
    return (
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle>Sign in required</CardTitle>
          <CardDescription>
            Please sign in to accept this invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/signin?callbackUrl=/invite/accept?token=${token}`}>
              Sign in
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Find invitation — must not have been accepted already, otherwise a used
  // token stays valid until expiry and a removed member could replay their old
  // invite link to silently rejoin the project.
  const invite = await databaseDrizzle.query.invitation.findFirst({
    where: and(
      eq(invitation.token, token),
      isNull(invitation.acceptedAt)
    ),
  });

  if (!invite || invite.expiresAt < new Date()) {
    return <InvalidInvite title="Invalid Invitation" action="home" message="This invitation is invalid used or has expired." />;
  }

  // Check if user already a member
  const existingMember = await databaseDrizzle.query.usersProjects.findFirst({
    where: and(
      eq(usersProjects.projectId, invite.projectId),
      eq(usersProjects.userId, session.user.id)
    ),
  });

  if (existingMember && invite.email === session.user.email) {
    // Already a member, just mark invitation as accepted and redirect
    await databaseDrizzle
      .update(invitation)
      .set({ acceptedAt: new Date() })
      .where(eq(invitation.id, invite.id));
    redirect(`/projects/${invite.projectId}`);
  }

  // Check if email matches
  if (invite.email !== session.user.email) {
    return <InvalidInvite title="Email mismatch" action="signout" token={token} message={`This invitation was sent to ${invite.email}, but you are signed in as ${session.user.email}. Please sign in with the correct account.`} />;
  }

  // Accept invitation: add user to project and mark invitation as accepted
  await databaseDrizzle.transaction(async (tx) => {
    await tx.insert(usersProjects).values({
      projectId: invite.projectId,
      userId: session.user.id,
      role: invite.role,
    });
    await tx
      .update(invitation)
      .set({ acceptedAt: new Date() })
      .where(eq(invitation.id, invite.id));
  });

  redirect(`/projects/${invite.projectId}`);
}

function InvalidInvite({ message, title, action, token }: { message: string, title: string, action: "home" | "signout", token?:string }) {
  return (
    <div className="w-full flex justify-center items-center">
      <Card size="sm" className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
        </CardContent>
        <CardFooter>
          {action === 'home' ? (<Button asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>) : (<LogoutBtn redirect={`/signin?callbackUrl=/invite/accept?token=${token}`} />)}
        </CardFooter>
      </Card>
    </div>
  );
}
