"use server";
import { databaseDrizzle } from "@/db";
import { tag } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { getProjectUserPermission } from "@/lib/permission/getProjectPermission";


const TagData = z.object({
  id: z.string().nullable(),
  projectId: z.string().min(3),
  name: z.string().min(1),
  color: z.string().min(3),
})


export async function upsertTagAction(_: FormState, formData: FormData) {
  try {
    const { id, projectId, name, color } = TagData.parse({
      id: formData.get("id"),
      projectId: formData.get("projectId"),
      name: formData.get("name"),
      color: formData.get("color")
    })

    const session = await auth.api.getSession({
      headers: await headers(),
    });


    if (!session?.user?.id) throw new Error("forbidden");

    const { role } = await getProjectUserPermission(session.user.id, projectId)
    if (role === 'anonymous') throw new Error("you don't have permission to create or update tags")

    const newTag: typeof tag.$inferInsert = {
      id: id ?? undefined,
      projectId: projectId,
      name: name,
      color: color
    }
    await databaseDrizzle
      .insert(tag)
      .values(newTag)
      .onConflictDoUpdate({ target: tag.id, set: newTag })

    revalidatePath(`/projects/${projectId}/feature-requests`);

    return toFormState("SUCCESS", "new Tag created");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}
