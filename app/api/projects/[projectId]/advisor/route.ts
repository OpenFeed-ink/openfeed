import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { databaseDrizzle } from "@/db"
import { askProductAdvisorStream } from "@/lib/Ai-agent/product-advisor"
import { getAuthorization } from "@/lib/billing/getAuthorization"
import { project } from "@/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { estimateTokens } from "@/lib/server/ai"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  // Auth check
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Verify user has access to this project
  const membership = await databaseDrizzle.query.usersProjects.findFirst({
    where: (up, ops) => ops.and(
      ops.eq(up.userId, session.user.id),
      ops.eq(up.projectId, projectId)
    ),
  })

  if (!membership) {
    return new Response("Forbidden", { status: 403 })
  }

  const projectData = await databaseDrizzle.query.project.findFirst({
    where: (u, ops) => ops.eq(u.id, projectId),
    columns: {
      tokensUsed: true,
    },
    with: {
      owner: {
        columns: {
          createdAt: true,
          plan: true
        }
      }
    }
  });

  if (!projectData) {
    return new Response("Project not found", { status: 404 });
  }

  const { limits } = getAuthorization(projectData.owner)

  const { question, history = [] } = await req.json()

  if (!question?.trim()) {
    return new Response("Question is required", { status: 400 })
  }

  if (question.length > 500) {
    return new Response("Question too long (max 500 characters)", { status: 400 })
  }

  const inputTokens =
    estimateTokens(question) +
    estimateTokens(JSON.stringify(history));

  if (inputTokens > 10_000) {
    return new Response("Input too large", { status: 400 });
  }

  // Reserve the input-token cost atomically in the same statement that checks
  // the cap, instead of checking tokensUsed here and writing the total back
  // only after the whole stream finishes. That gap let concurrent requests to
  // the same project all pass the check before any of them committed usage,
  // blowing past the plan's token cap. A conditional UPDATE is atomic per row
  // in Postgres, so concurrent requests serialize on it correctly.
  const cap = Math.floor(limits['productAdvisor_tokens'] * 0.95)
  const reserved = await databaseDrizzle
    .update(project)
    .set({ tokensUsed: sql`${project.tokensUsed} + ${inputTokens}` })
    .where(and(
      eq(project.id, projectId),
      sql`${project.tokensUsed} + ${inputTokens} <= ${cap}`
    ))
    .returning({ tokensUsed: project.tokensUsed })

  if (reserved.length === 0) {
    return new Response("AI usage limit reached. Please upgrade your plan.", {
      status: 429,
    });
  }

  let outputTokens = 0;
  // Create a streaming response
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const generator = askProductAdvisorStream(
          projectId,
          question,
          history
        )

        for await (const chunk of generator) {
          outputTokens += estimateTokens(chunk);
          controller.enqueue(encoder.encode(chunk))
        }

        // inputTokens was already reserved before streaming started — only the
        // output cost still needs to be added.
        if (outputTokens > 0) {
          await databaseDrizzle
            .update(project)
            .set({
              tokensUsed: sql`${project.tokensUsed} + ${outputTokens}`,
            })
            .where(eq(project.id, projectId));
        }

        controller.close()
      } catch (error) {
        console.error("[ProductAdvisor] Stream error:", error)
        if (outputTokens > 0) {
          await databaseDrizzle
            .update(project)
            .set({
              tokensUsed: sql`${project.tokensUsed} + ${outputTokens}`,
            })
            .where(eq(project.id, projectId));
        }
        controller.enqueue(
          encoder.encode("\n\nSorry, I encountered an error analyzing your data. Please try again.")
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
