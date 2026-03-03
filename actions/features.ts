"use server";
import { databaseDrizzle } from "@/db";
import { feature, project } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';


const ProjectData = z.object({
  id: z.string().nullable(),
  projectId: z.string().min(3),
  title: z.string().min(3),
  description: z.string().nullable(),
  status: z.enum(["under_review", "planned", "in_progress", "done", "closed"])

})
// todod
export async function upsertFeaturesAction(_: FormState, formData: FormData) {
  try {
    const { id, projectId, title, description, status } = ProjectData.parse({
      id: formData.get("id"),
      projectId: formData.get("projectId"),
      title: formData.get("title"),
      description: formData.get("description"),
      status: formData.get("status")
    })

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) throw new Error("forbidden");

    const newFeature: typeof feature.$inferInsert = {
      id: id ?? undefined,
      projectId: projectId,
      title: title,
      description: description,
      authorId: session.user.id,
      authorName: session.user.name,
      status: status,
    }

    await databaseDrizzle
      .insert(feature)
      .values(newFeature)
      .onConflictDoUpdate({ target: project.id, set: newFeature })

    revalidatePath(`/projects/${projectId}/feature-requests`);

    return toFormState("SUCCESS", "Your feature request has been added.");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}


export async function deleteFeatureAction(_: FormState, formData: FormData) {
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

