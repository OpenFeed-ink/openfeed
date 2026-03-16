"use server";

import { databaseDrizzle } from "@/db";
import { changelogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";


export async function upsertChangeLogAction(_: FormState, formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) throw new Error("forbidden");

    const newChangelog = z.object({
      id: z.string().optional(),
      projectId: z.string().min(2),
      title: z.string().min(3),
      content: z.string().min(2),
      category: z.enum(["new_feature", "improvement", "bug_fix"]),
      userId: z.string().min(3),
    }).parse({
      id: formData.get("id") ?? undefined,
      projectId: formData.get("projectId"),
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),
      userId: session.user.id
    })

    await databaseDrizzle
      .insert(changelogs)
      .values(newChangelog)
      .onConflictDoUpdate({ set: newChangelog, target: changelogs.id })

    revalidatePath(`/projects/${newChangelog.projectId}/changelog`);
    return toFormState("SUCCESS", "change log created..");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}

export async function deleteChangeLogAction(_: FormState, formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) throw new Error("forbidden");

    const { id, projectId } = z.object({
      id: z.string().min(3),
      projectId: z.string().min(2),
    }).parse({
      id: formData.get("id"),
      projectId: formData.get("projectId"),
    })

    await databaseDrizzle
      .delete(changelogs)
      .where(and(eq(changelogs.id, id), eq(changelogs.projectId, projectId)))

    revalidatePath(`/projects/${projectId}/changelog`);
    return toFormState("SUCCESS", "change log created..");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}
