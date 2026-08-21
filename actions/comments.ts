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

    const { id, projectId, featureId, content, parentId, name } = CommentData.parse({
      id: formData.get("id"),
      projectId: formData.get("projectId"),
      featureId: formData.get("featureId"),
      content: formData.get("content"),
      parentId: formData.get("parentId"),
      userId: formData.get("userId"),
      name: formData.get("name"),
    })
    // todo : update comment

    if (parentId) {
      // A parentId from a different feature would otherwise be silently
      // dropped by buildCommentTree (it just never finds a matching parent
      // node) — the reply would vanish from the UI with no error shown.
      // Reject it instead so the client knows the reply didn't post.
      const parentComment = await databaseDrizzle.query.comment.findFirst({
        where: (c, ops) => ops.eq(c.id, parentId),
        columns: { featureId: true },
      })
      if (!parentComment || parentComment.featureId !== featureId) {
        throw new Error("The comment you're replying to no longer exists on this feature.")
      }
    }

    const newComment: typeof comment.$inferInsert = {
      id: id ?? undefined,
      authorName: name,
      content: content,
      featureId: featureId,
      parentId: parentId
    }

    // Identity must come from the server, never a client-supplied form field —
    // otherwise a caller could impersonate another user as a comment's author,
    // or (when anonymous) claim ownership of someone else's visitor comment.
    if (session?.user.id) {
      newComment.authorId = session.user.id
    } else {
      const cookieStore = await cookies()
      const visitorToken = cookieStore.get("visitor_token")?.value
      if (!visitorToken) throw new Error("forbidden")
      newComment.visitorToken = visitorToken
    }

    await databaseDrizzle
      .insert(comment)
      .values(newComment)
      .onConflictDoUpdate({ target: comment.id, set: newComment })

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

    // Verify the feature actually belongs to this project, and — when pinning —
    // that the comment actually belongs to this feature. Without this, pin
    // rights on one project could pin an arbitrary comment from anywhere onto
    // any feature.
    const targetFeature = await databaseDrizzle.query.feature.findFirst({
      where: (f, ops) => ops.and(ops.eq(f.id, featureId), ops.eq(f.projectId, projectId)),
      columns: { id: true },
    })
    if (!targetFeature) throw new Error("feature not found")

    if (id) {
      const targetComment = await databaseDrizzle.query.comment.findFirst({
        where: (c, ops) => ops.eq(c.id, id),
        columns: { featureId: true },
      })
      if (!targetComment || targetComment.featureId !== featureId) {
        throw new Error("comment not found on this feature")
      }
    }

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
  // Optional chain the array index too — a logged-in author who has never
  // joined this specific project (any authenticated user can comment on a
  // public board) leaves usersProjects empty, not just author itself.
  const authorRole = currentComment.author?.usersProjects[0]?.role ?? "ANONYMOUS";

  const permit = await getProjectUserPermission(userId, projectId)

  const isOwner = currentComment.authorId === userId || currentComment.visitorToken === userId;
  const isMemeberFeature = currentComment.authorId != null && authorRole !== 'ANONYMOUS'
  if (!isOwner && (isMemeberFeature || !permit.deleteComment)) throw new Error(
    `You do not have permission to delete this comment`
  );

  return true
}
