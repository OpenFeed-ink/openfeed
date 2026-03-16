"use server";

import { databaseDrizzle } from "@/db";
import { changelogs } from "@/db/schema";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { revalidatePath } from "next/cache";
import { z } from "zod";


export async function upsertChangeLogAction(_: FormState, formData: FormData) {
  try {
    const newChangelog = z.object({
      id: z.string().optional(),
      projectId: z.string().min(2),
      title: z.string().min(3),
      content: z.string().min(2),
      category: z.enum(["new_feature", "improvement", "bug_fix"])
    }).parse({
      id: formData.get("id") ?? undefined,
      projectId: formData.get("projectId"),
      title: formData.get("title"),
      content: formData.get("content"),
      category: formData.get("category"),

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
