import OpenAI from "openai"
import { databaseDrizzle } from "@/db"
import { toolDefinitions, executeTool } from "./product-advisor-tools"

const client = new OpenAI({
  baseURL: process.env.OPENAI_ENDPOINT!,
  apiKey: process.env.OPENAI_KEY || "OPENAI_KEY",
})

// Max tool call rounds to prevent infinite loops
const MAX_ITERATIONS = 5

async function getProjectContext(projectId: string) {
  const project = await databaseDrizzle.query.project.findFirst({
    where: (p, ops) => ops.eq(p.id, projectId),
    columns: {
      name: true,
      description: true,
    },
  })
  if (!project) throw new Error("Project not found")
  return project
}

function buildSystemPrompt(projectName: string, projectDescription: string | null): string {
  return `You are the Product Advisor for "${projectName}" — an intelligent AI that helps the product team make better decisions based on real user feedback.

${projectDescription ? `Product context: ${projectDescription}` : ''}

You have access to tools that let you query live product data:
- get_top_features: see what users want most by upvotes
- get_roadmap_status: see what's planned, in progress, done
- get_feature_details: deep dive into a specific feature and its comments
- get_features_by_tag: see feedback grouped by category/theme
- get_recent_feedback: see what users have been asking for lately
- search_features: find features related to a specific topic

Your behavior:
- ALWAYS use tools before answering — never answer from assumptions
- Use multiple tools when needed — chain them to build a complete picture
- Be specific — reference actual feature titles and upvote counts in your answers
- Be actionable — give concrete recommendations, not generic advice
- Be honest — if data shows something the team might not want to hear, say it
- Be concise — no fluff, no filler words

When answering prioritization questions: always check both top_features AND roadmap_status
When answering trend questions: always check recent_feedback
When asked about a specific topic: always use search_features first`
}

// ============================================================
// STREAMING VERSION — for real-time UI
// Returns an async generator that yields text chunks
// ============================================================

export async function* askProductAdvisorStream(
  projectId: string,
  userQuestion: string,
  conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = []
): AsyncGenerator<string> {

  const project = await getProjectContext(projectId)

  // Build message history
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: buildSystemPrompt(project.name, project.description),
    },
    ...conversationHistory, // include previous turns for multi-turn conversation
    {
      role: "user",
      content: userQuestion,
    },
  ]

  let iterations = 0

  // Agentic loop — keeps running until AI stops calling tools
  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: toolDefinitions,
      tool_choice: "auto",
      stream: false, // we stream manually after tool calls are done
      max_tokens: 1500,
      temperature: 0.3, // lower = more consistent, factual responses
    })

    const message = response.choices[0].message

    // Add assistant message to history
    messages.push(message)

    // Check if AI wants to call tools
    if (message.tool_calls && message.tool_calls.length > 0) {

      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          if (toolCall.type === 'function') {
            const args = JSON.parse(toolCall.function.arguments)
            const result = await executeTool(toolCall.function.name, args, projectId)

            return {
              tool_call_id: toolCall.id,
              role: "tool" as const,
              content: result,
            }
          }
          return {
            tool_call_id: toolCall.id,
            role: "tool" as const,
            content: "",
          }
        })
      )

      // Add tool results to message history
      messages.push(...toolResults)

      // Continue the loop — AI will process results and either call more tools or answer
      continue
    }

    // No more tool calls — AI is ready to give final answer
    // Stream the final response character by character
    const finalContent = message.content || ""

    // Simulate streaming by yielding chunks
    // In production you can use actual streaming for the final response
    const words = finalContent.split(' ')
    for (const word of words) {
      yield word + ' '
      // Small delay to make streaming feel natural
      await new Promise(resolve => setTimeout(resolve, 20))
    }

    return // done
  }

  // Fallback if max iterations reached
  yield "I analyzed your feedback data but reached my thinking limit. Please try asking a more specific question."
}

// ============================================================
// NON-STREAMING VERSION — for background jobs or simple cases
// ============================================================

export async function askProductAdvisor(
  projectId: string,
  userQuestion: string,
  conversationHistory: OpenAI.Chat.ChatCompletionMessageParam[] = []
): Promise<string> {

  const project = await getProjectContext(projectId)

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: buildSystemPrompt(project.name, project.description),
    },
    ...conversationHistory,
    {
      role: "user",
      content: userQuestion,
    },
  ]

  let iterations = 0

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: toolDefinitions,
      tool_choice: "auto",
      max_tokens: 1500,
      temperature: 0.3,
    })

    const message = response.choices[0].message
    messages.push(message)

    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolResults = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          if (toolCall.type === 'function') {
            const args = JSON.parse(toolCall.function.arguments)
            const result = await executeTool(toolCall.function.name, args, projectId)
            return {
              tool_call_id: toolCall.id,
              role: "tool" as const,
              content: result,
            }
          }
          return {
            tool_call_id: toolCall.id,
            role: "tool" as const,
            content: "",
          }
        })
      )
      messages.push(...toolResults)
      continue
    }

    return message.content || "No response generated."
  }

  return "Analysis complete. Please try a more specific question."
}
