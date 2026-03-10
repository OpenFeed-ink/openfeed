"use server";
import { databaseDrizzle } from "@/db";
import { feature, upvote } from "@/db/schema";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { and, eq, sql } from 'drizzle-orm';

const UpvoteData = z.object({
  featureId: z.string().min(3),
  projectId: z.string().min(3),
  voterToken: z.string().min(3)
})

export async function upvotesAction(_: FormState, formData: FormData) {
  try {
    const { featureId, projectId, voterToken } = UpvoteData.parse({
      featureId: formData.get("featureId"),
      projectId: formData.get("projectId"),
      voterToken: formData.get("voterToken")
    })


    await databaseDrizzle.transaction(async (tx) => {
      // 1. try to delete existing vote
      const deleted = await tx
        .delete(upvote)
        .where(
          and(
            eq(upvote.featureId, featureId),
            eq(upvote.voterToken, voterToken),
          )
        )
        .returning({ id: upvote.id })

      if (deleted.length > 0) {
        //2. If existed → decrement
        await tx
          .update(feature)
          .set({
            upvotesCount: sql`${feature.upvotesCount} - 1`,
          })
          .where(eq(feature.id, featureId))
      } else {
        // 3. f not existed → insert
        await tx.insert(upvote).values({
          featureId,
          voterToken,
        })

        await tx
          .update(feature)
          .set({
            upvotesCount: sql`${feature.upvotesCount} + 1`,
          })
          .where(eq(feature.id, featureId))
      }
    })

    revalidatePath(`/projects/${projectId}/feature-requests`);

    return toFormState("SUCCESS", "update upvote")
  } catch (e) {
    return fromErrorToFormState(e)
  }
}
