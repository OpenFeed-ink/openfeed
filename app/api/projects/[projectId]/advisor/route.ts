import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { databaseDrizzle } from "@/db"
import { askProductAdvisorStream } from "@/lib/Ai-agent/product-advisor"

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

  const { question, history = [] } = await req.json()

  if (!question?.trim()) {
    return new Response("Question is required", { status: 400 })
  }

  if (question.length > 500) {
    return new Response("Question too long (max 500 characters)", { status: 400 })
  }

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
          controller.enqueue(encoder.encode(chunk))
        }

        controller.close()
      } catch (error) {
        console.error("[ProductAdvisor] Stream error:", error)
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
