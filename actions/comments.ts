"use server";
import { databaseDrizzle } from "@/db";
import { comment, feature } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { cookies, headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { getProjectUserPermission } from "@/lib/permission/getProjectPermission";


const CommentData = z.object({
  id: z.string().nullable(),
  projectId: z.string().min(3),
  featureId: z.string().min(3),
  content: z.string().trim().min(1),
  parentId: z.string().nullable(),
  userId: z.string().nullable(),
  name: z.string().nullable(),
})

export async function upsertCommentAction(_: FormState, formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { id, projectId, featureId, content, parentId, userId, name } = CommentData.parse({
      id: formData.get("id"),
      projectId: formData.get("projectId"),
      featureId: formData.get("featureId"),
      content: formData.get("content"),
      parentId: formData.get("parentId"),
      userId: formData.get("userId"),
      name: formData.get("name"),
    })
    // todo : update comment

    const newComment: typeof comment.$inferInsert = {
      id: id ?? undefined,
      authorName: name,
      content: content,
      featureId: featureId,
      parentId: parentId
    }

    if (session?.user.id) {
      newComment.authorId = userId
    } else {
      newComment.visitorToken = userId
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

    let userId = session?.user.id
    if (!userId) {
      const cookieStore = await cookies()
      userId = cookieStore.get("visitor_token")?.value
    }

    if (!userId) throw new Error("forbidden");

    await canDeleteComment(id, projectId, userId)

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

export async function pinCommentAction(_: FormState, formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user.id) throw new Error("forbidden");

    const { id, featureId, projectId } = z.object({
      id: z.string().min(5).nullable(),
      featureId: z.string().min(5),
      projectId: z.string().min(5)
    }).parse({
      id: formData.get("id"),
      featureId: formData.get("featureId"),
      projectId: formData.get("projectId"),
    })

    const permit = await getProjectUserPermission(session.user.id, projectId)
    if (!permit.canPin) throw new Error("you don't have permission to pin comments in this project")

    await databaseDrizzle
      .update(feature)
      .set({ pinnedComment: id })
      .where(eq(feature.id, featureId));

    revalidatePath(`/projects/${projectId}/feature-requests`);

    return toFormState("SUCCESS", id ? "Comment pinned" : "Comment unpinned");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}

const canDeleteComment = async (commentId: string, projectId: string, userId: string) => {

  const currentComment = await databaseDrizzle.query.comment.findFirst({
    where: (c, ops) => ops.eq(c.id, commentId),
    columns: {
      authorId: true,
      visitorToken: true,
    },
    with: {
      author: {
        with: {
          usersProjects: {
            where: (up, ops) => ops.eq(up.projectId, projectId),
            columns: {
              role: true
            }
          }
        }
      }
    }

  })

  if (!currentComment) throw new Error("comment not found")
  const authorRole = currentComment.author?.usersProjects[0].role ?? "ANONYMOUS";

  const permit = await getProjectUserPermission(userId, projectId)

  const isOwner = currentComment.authorId === userId || currentComment.visitorToken === userId;
  const isMemeberFeature = currentComment.authorId != null && authorRole !== 'ANONYMOUS'
  if (!isOwner && (isMemeberFeature || !permit.deleteComment)) throw new Error(
    `You do not have permission to delete this comment`
  );

  return true
}
