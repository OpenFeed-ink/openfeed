"use server";

import { databaseDrizzle } from "@/db";
import { invitation, project, user, usersProjects } from "@/db/schema";
import InvitationEmail from "@/emails/invitation";
import { auth } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { fromErrorToFormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";


export async function inviteMemberAction(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user.id) throw new Error("Unauthorized");
    const { projectId, email, role } = z.object({
      projectId: z.string().min(4),
      email: z.email(),
      role: z.enum(["ADMIN", "MEMBER"]),
    }).parse({
      projectId: formData.get("projectId"),
      email: formData.get("email"),
      role: formData.get("role"),
    })

    const membership = await databaseDrizzle.query.usersProjects.findFirst({
      where: and(
        eq(usersProjects.projectId, projectId),
        eq(usersProjects.userId, session.user.id),
        eq(usersProjects.role, "ADMIN")
      ),
    });
    if (!membership) throw new Error("You must be an admin to invite members");

    // Get project name and inviter name
    const proj = await databaseDrizzle.query.project.findFirst({
      where: eq(project.id, projectId),
      columns: { name: true },
    });
    if (!proj) throw new Error("Project not found");


    // Check if user already a member
    const existingUser = await databaseDrizzle.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      const existingMember = await databaseDrizzle.query.usersProjects.findFirst({
        where: and(
          eq(usersProjects.projectId, projectId),
          eq(usersProjects.userId, existingUser.id)
        ),
      });
      if (existingMember) throw new Error("User is already a member");
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);

    const newInvitation: typeof invitation.$inferInsert = {
      projectId,
      email,
      role,
      token,
      expiresAt,
    }

    await databaseDrizzle
      .insert(invitation)
      .values(newInvitation)
      .onConflictDoUpdate({
        target: [invitation.email],
        set: newInvitation
      })

    const acceptUrl = `${process.env.BETTER_AUTH_URL}/invite/accept?token=${token}`;
    const { error } = await resend.emails.send({
      from: `OpenFeed <${process.env.RESEND_EMAIL}>`,
      to: [email],
      subject: `Join ${project.name} on OpenFeed`,
      react: InvitationEmail({
        inviterName: session.user.name || session.user.email || "A team member",
        projectName: proj.name,
        role,
        acceptUrl,
        email,
      }),
    });

    if (error) throw new Error("Failed to send invitation email");

    revalidatePath(`/projects/${projectId}/team`);
    return toFormState("SUCCESS", "Invitation sent!");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}
