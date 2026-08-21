"use server";
import { nanoid } from 'nanoid'
import { databaseDrizzle } from "@/db";
import { project, usersProjects } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { eq, sql, count } from 'drizzle-orm';
import { getServerSession } from '@/lib/server/session';
import { getAuthorizationWithUser } from '@/lib/billing/getAuthorization';


const ProjectData = z.object({
  id: z.string().nullable(),
  name: z.string().min(3),
  description: z.string().nullable()
})

export async function upsertProjectAction(_: FormState, formData: FormData) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) throw new Error("forbidden");

    const { id, name, description } = ProjectData.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      id: formData.get("id")
    })

    if (id) {
      await canUpdateDeleteProject(session.user.id, id)
    } else {
      await canCreateProject(session.user.id)
    }

    const projectId = id ?? nanoid()

    const newProject: typeof project.$inferInsert = {
      id: projectId,
      name,
      ownerId: session.user.id,
      description,
    }

    await databaseDrizzle.transaction(async (tx) => {

      const projId = await tx
        .insert(project)
        .values(newProject)
        .onConflictDoUpdate({ target: project.id, set: newProject })
        .returning({ id: project.id })
        .then(id => id[0].id)

      if (projId) {
        const newRelation: typeof usersProjects.$inferInsert = { userId: session.user.id, projectId: projId, role: 'ADMIN' }
        await tx.insert(usersProjects)
          .values(newRelation)
          .onConflictDoUpdate({
            target: [usersProjects.userId, usersProjects.projectId],
            set: newRelation
          })
      }
    })
    revalidatePath("/projects");
    return toFormState("SUCCESS", projectId);
  } catch (e) {
    return fromErrorToFormState(e);
  }
}


export async function deleteProjectAction(_: FormState, formData: FormData) {
  try {
    const { id } = z.object({
      id: z.string().min(5)
    }).parse({
      id: formData.get("id")
    })

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) throw new Error("forbidden");

    await canUpdateDeleteProject(session.user.id, id)

    await databaseDrizzle.transaction(async (tx) => {
      const userProject = await tx.query.usersProjects.findFirst({
        where: (up, ops) => ops.and(
          ops.eq(up.userId, session.user.id),
          ops.eq(up.projectId, id)
        )
      })
      if (!userProject) throw new Error("project not found")

      if (userProject.role !== "ADMIN") throw new Error("you don't have primintion to delete this project")

      await tx.delete(project).where(eq(project.id, id))
    })

    revalidatePath("/projects");
    return toFormState("SUCCESS", "The project has been removed.");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}

export async function toggleRoadmapColumn(_: FormState, formData: FormData) {
  try {
    const { id, hide, status } = z.object({
      id: z.string().min(5),
      hide: z.string().transform(t => t.toLowerCase() === "true"),
      status: z.string().min(3),
    }).parse({
      id: formData.get("projectId"),
      hide: formData.get("hide"),
      status: formData.get("status")
    })

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) throw new Error("forbidden");

    await canUpdateDeleteProject(session.user.id, id)


    if (hide) {
      // Add status to hidden columns array, but only if it isn't already
      // there — a retried/duplicate request would otherwise grow the array
      // with repeated entries of the same status indefinitely.
      await databaseDrizzle
        .update(project)
        .set({
          roadmapHiddenColumns: sql`CASE WHEN ${status} = ANY(${project.roadmapHiddenColumns}) THEN ${project.roadmapHiddenColumns} ELSE array_append(${project.roadmapHiddenColumns}, ${status}) END`,
        })
        .where(eq(project.id, id));
    } else {
      // Remove status from hidden columns array
      await databaseDrizzle
        .update(project)
        .set({
          roadmapHiddenColumns: sql`array_remove(${project.roadmapHiddenColumns}, ${status})`,
        })
        .where(eq(project.id, id));
    }

    revalidatePath(`/projects/${id}/roadmap`);
    return toFormState("SUCCESS", `Column ${status.replaceAll("_", " ")} will ${hide ? "no longer" : "now"} appear on public roadmap.`);
  } catch (e) {
    return fromErrorToFormState(e);
  }
}


async function canCreateProject(userId: string) {
  const { limits } = await getAuthorizationWithUser(userId)

  const limit = limits['project']

  const used = await databaseDrizzle
    .select({ count: count() })
    .from(project)
    .where(eq(project.ownerId, userId))
    .then(proj => proj[0].count)

  if (used >= limit) {
    throw new Error(
      `Limit reached for creating new feature. Upgrade your plan.`
    );
  }
  return true;
}

async function canUpdateDeleteProject(userId: string, projectId: string) {
  const usersProjectsData = await databaseDrizzle.query.usersProjects.findFirst({
    columns: {
      role: true,
    },
    where: (up, ops) => ops.and(
      ops.eq(up.userId, userId),
      ops.eq(up.projectId, projectId)
    )
  })
  if (!usersProjectsData || usersProjectsData.role !== 'ADMIN') throw new Error("You don't have permission to update this project")
  return true
}
