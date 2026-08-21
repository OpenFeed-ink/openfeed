"use server";
import { databaseDrizzle } from "@/db";
import { feature, featureTags } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { cookies, headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { and, eq, count } from 'drizzle-orm';
import { SimilarFeature } from "@/type";
import { smartRankedQuery } from "@/db/utils";
import { getServerSession } from "@/lib/server/session";
import { getAuthorizationWithProject } from "@/lib/billing/getAuthorization";
import { getProjectUserPermission } from "@/lib/permission/getProjectPermission";


const ProjectData = z.object({
  id: z.string().nullable(),
  projectId: z.string().min(3),
  title: z.string().min(3),
  userId: z.string().min(3),
  userName: z.string().min(3),
  description: z.string().nullable(),
  tagIds: z.string().array(),
  status: z.enum(["under_review", "planned", "in_progress", "done", "closed"]),
})

export async function upsertFeaturesAction(_: FormState, formData: FormData) {
  try {
    const session = await getServerSession()

    const { id, projectId, title, description, status, tagIds, userName, userId: formUserId } = ProjectData.parse({
      id: formData.get("id"),
      projectId: formData.get("projectId"),
      title: formData.get("title"),
      description: formData.get("description"),
      status: formData.get("status"),
      tagIds: formData.getAll("tagIds"),
      userId: formData.get("userId"),
      userName: formData.get("userName"),
    })

    // Anonymous identity must come from the httpOnly visitor_token cookie, never
    // from a client-supplied form field — otherwise anyone calling this action
    // directly could claim ownership of another visitor's feature request.
    let userId = formUserId
    if (!session?.user.id) {
      const cookieStore = await cookies()
      const visitorToken = cookieStore.get("visitor_token")?.value
      if (!visitorToken) throw new Error("forbidden")
      userId = visitorToken
    }

    if (id) {
      await canUpdateFeature(session?.user.id ?? userId, id)
    } else {
      await canCreateFeature(projectId)
    }

    const newFeature: typeof feature.$inferInsert = {
      id: id ?? undefined,
      projectId: projectId,
      title: title,
      description: description,
      authorName: userName,
      status: status,
    }

    if (session?.user.id) {
      newFeature.authorId = session.user.id
      newFeature.authorName = session.user.name
    } else {
      newFeature.visitorToken = userId
    }


    await databaseDrizzle.transaction(async (tx) => {
      const featureId = await tx
        .insert(feature)
        .values(newFeature)
        .onConflictDoUpdate({ target: feature.id, set: newFeature })
        .returning({ id: feature.id })
        .then(res => res[0].id)

      if (tagIds.length === 0) return;

      const features = tagIds.map(tagId => ({ featureId, tagId }))

      await tx.insert(featureTags)
        .values(features)
        .onConflictDoNothing()
    })

    revalidatePath(`/projects/${projectId}/feature-requests`);
    return toFormState("SUCCESS", "Your feature request has been added.");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}

export async function checkFeatureSimilar(
  _: FormState,
  formData: FormData
): Promise<FormState<SimilarFeature[]>> {
  try {
    const { title, projectId } = z.object({
      projectId: z.string().min(3),
      title: z.string().min(3),
    }).parse({
      projectId: formData.get("projectId"),
      title: formData.get("title"),
    })
    const top = await smartRankedQuery(title, projectId)
    const results: SimilarFeature[] = top.map((r) => ({
      id: r.id as string,
      title: r.title as string,
      description: r.description as string,
      status: r.status as "under_review" | "planned" | "in_progress" | "done" | "closed",
      upvotesCount: r.upvotes_count as number
    }))

    return toFormState<SimilarFeature[]>("SUCCESS", "Your feature request has been added.", results);
  } catch (e) {
    return fromErrorToFormState(e);
  }
}

export async function deleteFeatureAction(_: FormState, formData: FormData) {
  try {
    const { id, projectId } = z.object({
      id: z.string().min(5),
      projectId: z.string().min(5)
    }).parse({
      id: formData.get("id"),
      projectId: formData.get("projectId")
    })

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) throw new Error("forbidden");
    //todo all vistor to delete owen feature 

    await canDeleteFeature(session.user.id, id, projectId)

    await databaseDrizzle.
      delete(feature).
      where(and(eq(feature.id, id), eq(feature.projectId, projectId)))

    revalidatePath(`/projects/${projectId}/feature-requests`);
    return toFormState("SUCCESS", "The feature request has been removed.");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}

export async function updateFeatureStatus(_: FormState, formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) throw new Error("forbidden");

    const { featureId, newStatus, projectId } = z.object({
      featureId: z.string().min(5),
      newStatus: z.enum(["under_review", "planned", "in_progress", "done", "closed"]),
      projectId: z.string().min(5)
    }).parse({
      featureId: formData.get("featureId"),
      newStatus: formData.get("newStatus"),
      projectId: formData.get("projectId")
    })

    await canUpdateFeatureStatus(session.user.id, featureId, projectId)

    await databaseDrizzle
      .update(feature)
      .set({ status: newStatus })
      .where(and(eq(feature.id, featureId), eq(feature.projectId, projectId)))

    revalidatePath(`/projects/${projectId}/roadmap`);
    return toFormState("SUCCESS", "The Feature status has been updated.");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}


async function canCreateFeature(projectId: string) {
  const { limits } = await getAuthorizationWithProject(projectId)

  const used = await databaseDrizzle
    .select({ count: count() })
    .from(feature)
    .where(eq(feature.projectId, projectId))
    .then(proj => proj[0].count)

  const limit = limits['featureRequest']

  if (used >= limit) {
    throw new Error(
      `Limit reached for creating new feature. Upgrade your plan.`
    );
  }
  return true;
}

async function canUpdateFeature(userId: string, featureId: string) {
  const feature = await databaseDrizzle.query.feature.findFirst({
    where: (f, ops) => ops.eq(f.id, featureId),
    columns: {
      projectId: true,
      authorId: true,
      visitorToken: true
    }
  })
  if (!feature) throw new Error("feature not found")
  const premit = await getProjectUserPermission(userId, feature.projectId)
  if (premit.role === 'anonymous' && feature.visitorToken === userId) return true
  if (feature.authorId === userId) return true;
  // The UI shows an edit button to anyone with editFeature (e.g. ADMIN), not
  // just the original author — the server was never actually granting that,
  // so a non-author admin would see a working-looking edit button that always
  // failed on submit.
  if (premit.editFeature) return true;

  throw new Error(
    `You do not have permission to update this feature request`
  );
}

async function canUpdateFeatureStatus(userId: string, featureId: string, projectId: string) {
  // Roadmap curation (moving a card between Planned/In Progress/Done) is a team
  // action, distinct from a feature's author editing their own title/description
  // via canUpdateFeature — an anonymous visitor or the original requester should
  // never be able to move their own card through the public roadmap.
  const targetFeature = await databaseDrizzle.query.feature.findFirst({
    where: (f, ops) => ops.and(ops.eq(f.id, featureId), ops.eq(f.projectId, projectId)),
    columns: { id: true },
  })
  if (!targetFeature) throw new Error("feature not found")

  const permit = await getProjectUserPermission(userId, projectId)
  if (!permit.editFeature) {
    throw new Error("You do not have permission to update the roadmap status of this feature")
  }
  return true
}

async function canDeleteFeature(userId: string, featureId: string, projectId: string) {
  const feature = await databaseDrizzle.query.feature.findFirst({
    where: (f, ops) => ops.and(ops.eq(f.id, featureId), ops.eq(f.projectId, projectId)),
    columns: {
      projectId: true,
      authorId: true,
      visitorToken: true
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

  if (!feature) throw new Error("feature not found")
  // Optional chain the array index too — a logged-in author who has never
  // joined this specific project (any authenticated user can file a request on
  // a public board) leaves usersProjects empty, not just author itself.
  const authorRole = feature.author?.usersProjects[0]?.role ?? "ANONYMOUS";

  const permit = await getProjectUserPermission(userId, feature.projectId)

  const isOwner = feature.authorId === userId && feature.authorId !== null;
  const isMemeberFeature = feature.authorId != null && authorRole !== 'ANONYMOUS'
  if (!isOwner && (isMemeberFeature || !permit.deleteAnyFeature)) throw new Error(
    `You do not have permission to delete this feature request`
  );

  return true
}
