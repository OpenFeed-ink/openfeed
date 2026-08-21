"use server";
import { databaseDrizzle } from "@/db";
import { feature, upvote } from "@/db/schema";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { z } from "zod";
import { revalidatePath } from 'next/cache';
import { and, eq, sql } from 'drizzle-orm';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const UpvoteData = z.object({
  featureId: z.string().min(3),
  projectId: z.string().min(3),
  voterToken: z.string().min(3)
})

export async function upvotesAction(_: FormState, formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { featureId, projectId, voterToken } = UpvoteData.parse({
      featureId: formData.get("featureId"),
      projectId: formData.get("projectId"),
      voterToken: formData.get("voterToken")
    })
    let userId = voterToken

    if (session?.user.id) {
      userId = session.user.id
    }

    await databaseDrizzle.transaction(async (tx) => {
      // 1. try to delete existing vote
      const deleted = await tx
        .delete(upvote)
        .where(
          and(
            eq(upvote.featureId, featureId),
            eq(upvote.voterToken, userId),
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
          voterToken: userId,
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
  } catch (e: any) {
    // Two toggles for the same feature+voter racing (e.g. a fast double-click
    // firing two requests) can both pass the "no existing vote" check and
    // both attempt to insert — the loser hits the unique constraint. That's
    // not a real failure: the vote is already registered by the winner, so
    // treat it as success instead of surfacing a raw DB error to the user.
    const pgCode = e?.code ?? e?.cause?.code
    if (pgCode === "23505") {
      const raceProjectId = formData.get("projectId")
      if (typeof raceProjectId === "string") {
        revalidatePath(`/projects/${raceProjectId}/feature-requests`);
      }
      return toFormState("SUCCESS", "update upvote")
    }
    return fromErrorToFormState(e)
  }
}
