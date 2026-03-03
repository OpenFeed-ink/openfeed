"use server";
import { databaseDrizzle } from "@/db";
import { comment } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';


const CommentData = z.object({
  id: z.string().nullable(),
  projectId: z.string().min(3),
  featureId: z.string().min(3),
  content: z.string().trim().min(1),

})

export async function upsertCommentAction(_: FormState, formData: FormData) {
  try {
    const { id, projectId, featureId, content } = CommentData.parse({
      id: formData.get("id"),
      projectId: formData.get("projectId"),
      featureId: formData.get("featureId"),
      content: formData.get("content")
    })

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) throw new Error("forbidden");

    const newComment: typeof comment.$inferInsert = {
      id: id ?? undefined,
      authorName: session.user.name,
      authorId: session.user.id,
      content: content,
      featureId: featureId,
    }

    await databaseDrizzle
      .insert(comment)
      .values(newComment)
      .onConflictDoUpdate({ target: comment.id, set: comment })

    revalidatePath(`/projects/${projectId}/feature-requests`);

    return toFormState("SUCCESS", "");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}


export async function deleteCommentAction(_: FormState, formData: FormData) {
  try {
    const { id, projectId, featureId } = z.object({
      id: z.string().min(5),
      featureId: z.string().min(5),
      projectId: z.string().min(5)
    }).parse({
      id: formData.get("id"),
      projectId: formData.get("projectId"),
      featureId: formData.get("featureId")
    })

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) throw new Error("forbidden");

    await databaseDrizzle.
      delete(comment).
      where(and(
      eq(comment.id, id),
      eq(comment.featureId, featureId), 
    ))

    revalidatePath(`/projects/${projectId}/feature-requests`);
    return toFormState("SUCCESS", "The comment has been removed.");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}

