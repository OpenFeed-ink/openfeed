"use server";
import { nanoid } from 'nanoid'
import { databaseDrizzle } from "@/db";
import { project } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';


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

    const newProject = {
      id: projectId,
      name,
      description,
      userId: session.user.id,
    }

    await databaseDrizzle
      .insert(project)
      .values(newProject).onConflictDoUpdate({ target: project.id, set: newProject })

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

    await databaseDrizzle.
      delete(project).
      where(and(eq(project.id, id), eq(project.userId, session.user.id)))

    revalidatePath("/projects");
    return toFormState("SUCCESS", "The project has been removed.");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}

