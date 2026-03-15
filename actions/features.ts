"use server";
import { databaseDrizzle } from "@/db";
import { feature, featureTags } from "@/db/schema";
import { auth } from "@/lib/auth";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from 'next/cache';
import { and, eq } from 'drizzle-orm';
import { SimilarFeature } from "@/type";
import { smartRankedQuery } from "@/db/utils";


const ProjectData = z.object({
  id: z.string().nullable(),
  projectId: z.string().min(3),
  title: z.string().min(3),
  userId: z.string().min(3),
  userName: z.string().min(3),
  description: z.string().nullable(),
  tagIds: z.string().array(),
  status: z.enum(["under_review", "planned", "in_progress", "done", "closed"]),
  isAnonymous: z.enum(["FALSE", "TRUE"])
})


export async function upsertFeaturesAction(_: FormState, formData: FormData) {
  try {
    const { id, projectId, title, description, status, tagIds, userName, userId, isAnonymous } = ProjectData.parse({
      id: formData.get("id"),
      projectId: formData.get("projectId"),
      title: formData.get("title"),
      description: formData.get("description"),
      status: formData.get("status"),
      tagIds: formData.getAll("tagIds"),
      userId: formData.get("userId"),
      userName: formData.get("userName"),
      isAnonymous: formData.get("isAnonymous")
    })

    const newFeature: typeof feature.$inferInsert = {
      id: id ?? undefined,
      projectId: projectId,
      title: title,
      description: description,
      authorName: userName,
      status: status,
    }

    if (isAnonymous === 'TRUE') {
      newFeature.visitorToken = userId
    } else {
      newFeature.authorId = userId
    }

    await databaseDrizzle.transaction(async (tx) => {
      const featureId = await tx
        .insert(feature)
        .values(newFeature)
        .onConflictDoUpdate({ target: feature.id, set: newFeature })
        .returning({ id: feature.id })
        .then(res => res[0].id)

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
    await databaseDrizzle
      .update(feature)
      .set({ status: newStatus })
      .where(eq(feature.id, featureId))

    revalidatePath(`/projects/${projectId}/roadmap`);
    return toFormState("SUCCESS", "The Feature status has been updated.");
  } catch (e) {
    return fromErrorToFormState(e);
  }
}
