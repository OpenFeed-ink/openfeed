"use server";
import { nanoid } from 'nanoid'
import { databaseDrizzle } from "@/db";
import { project, usersProjects } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { eq, sql } from 'drizzle-orm';


const ProjectData = z.object({
  id: z.string().nullable(),
  name: z.string().min(3),
  description: z.string().nullable()
})

export async function upsertProjectAction(_: FormState, formData: FormData) {
  try {
    const { id, name, description } = ProjectData.parse({
      name: formData.get("name"),
      description: formData.get("description"),
      id: formData.get("id")
    })

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) throw new Error("forbidden");
    const projectId = id ?? nanoid()

    const newProject: typeof project.$inferInsert = {
      id: projectId,
      name,
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


    if (hide) {
      // Add status to hidden columns array
      await databaseDrizzle
        .update(project)
        .set({
          roadmapHiddenColumns: sql`array_append(${project.roadmapHiddenColumns}, ${status})`,
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
