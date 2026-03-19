import { databaseDrizzle } from "@/db"

// ============================================================
// TOOL DEFINITIONS — what the AI can call
// These are the "actions" available to the agentic AI
// ============================================================

export const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "get_top_features",
      description: `Get the most upvoted feature requests for this project. 
        Use this to understand what users want most. 
        Call this first when answering prioritization questions.`,
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "How many features to return. Default 20, max 50.",
          },
          status: {
            type: "string",
            enum: ["under_review", "planned", "in_progress", "done", "closed", "all"],
            description: "Filter by status. Use 'all' to see everything.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_roadmap_status",
      description: `Get the current roadmap — what is planned, in progress, and done.
        Use this to understand what the team is already working on before making recommendations.
        Essential for answering "what should we build next" questions.`,
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_feature_details",
      description: `Get full details for a specific feature including all comments.
        Use this when you need to deeply understand a specific user request.
        Good for: understanding the WHY behind a request, seeing user pain points in comments.`,
      parameters: {
        type: "object",
        properties: {
          featureId: {
            type: "string",
            description: "The UUID of the feature to get details for.",
          },
        },
        required: ["featureId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_features_by_tag",
      description: `Get features grouped by their tags/categories.
        Use this to identify themes and patterns in user feedback.
        Helpful for: "what areas do users care about most?"`,
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_recent_feedback",
      description: `Get the most recently submitted feature requests (last 30 days).
        Use this to identify emerging trends and new user pain points.
        Good for: "what are users asking for lately?"`,
      parameters: {
        type: "object",
        properties: {
          days: {
            type: "number",
            description: "How many days back to look. Default 30.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_features",
      description: `Search features by keyword in title or description.
        Use this when the user asks about a specific topic or feature area.
        Example: if user asks about "performance" — search for performance-related features.`,
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Keyword to search for in feature titles and descriptions.",
          },
        },
        required: ["keyword"],
      },
    },
  },
]

// ============================================================
// TOOL EXECUTORS — the actual database queries
// ============================================================

export async function executeTool(
  toolName: string,
  toolArgs: Record<string, any>,
  projectId: string
): Promise<string> {
  
  try {
    switch (toolName) {

      case "get_top_features": {
        const limit = Math.min(toolArgs.limit || 20, 50)
        const statusFilter = toolArgs.status && toolArgs.status !== "all" 
          ? toolArgs.status 
          : null

        const features = await databaseDrizzle.query.feature.findMany({
          where: (f, ops) => statusFilter 
            ? ops.and(ops.eq(f.projectId, projectId), ops.eq(f.status, statusFilter))
            : ops.eq(f.projectId, projectId),
          columns: {
            id: true,
            title: true,
            description: true,
            status: true,
            upvotesCount: true,
            createdAt: true,
          },
          orderBy: (f, ops) => ops.desc(f.upvotesCount),
          limit,
        })

        if (features.length === 0) {
          return "No feature requests found for this project yet."
        }

        const formatted = features.map((f, i) => 
          `${i + 1}. [${f.id}] "${f.title}" — ${f.upvotesCount} upvotes | status: ${f.status}${
            f.description ? ` | "${f.description.slice(0, 100)}${f.description.length > 100 ? '...' : ''}"` : ''
          }`
        ).join('\n')

        return `Top ${features.length} features by upvotes:\n${formatted}`
      }

      case "get_roadmap_status": {
        const roadmapFeatures = await databaseDrizzle.query.feature.findMany({
          where: (f, ops) => ops.and(
            ops.eq(f.projectId, projectId),
            ops.inArray(f.status, ["planned", "in_progress", "done"])
          ),
          columns: {
            id: true,
            title: true,
            status: true,
            upvotesCount: true,
          },
          orderBy: (f, ops) => ops.desc(f.upvotesCount),
        })

        if (roadmapFeatures.length === 0) {
          return "No items on the roadmap yet. All features are under review."
        }

        const byStatus = {
          in_progress: roadmapFeatures.filter(f => f.status === "in_progress"),
          planned: roadmapFeatures.filter(f => f.status === "planned"),
          done: roadmapFeatures.filter(f => f.status === "done"),
        }

        const sections = []

        if (byStatus.in_progress.length > 0) {
          sections.push(`IN PROGRESS (${byStatus.in_progress.length}):\n${
            byStatus.in_progress.map(f => `  - "${f.title}" (${f.upvotesCount} upvotes)`).join('\n')
          }`)
        }

        if (byStatus.planned.length > 0) {
          sections.push(`PLANNED (${byStatus.planned.length}):\n${
            byStatus.planned.map(f => `  - "${f.title}" (${f.upvotesCount} upvotes)`).join('\n')
          }`)
        }

        if (byStatus.done.length > 0) {
          sections.push(`RECENTLY DONE (${Math.min(byStatus.done.length, 5)}):\n${
            byStatus.done.slice(0, 5).map(f => `  - "${f.title}"`).join('\n')
          }`)
        }

        return `Current roadmap:\n\n${sections.join('\n\n')}`
      }

      case "get_feature_details": {
        const { featureId } = toolArgs

        const featureData = await databaseDrizzle.query.feature.findFirst({
          where: (f, ops) => ops.and(
            ops.eq(f.id, featureId),
            ops.eq(f.projectId, projectId) // security: ensure feature belongs to project
          ),
          columns: {
            id: true,
            title: true,
            description: true,
            status: true,
            upvotesCount: true,
            authorName: true,
            createdAt: true,
          },
          with: {
            comments: {
              columns: {
                id: true,
                content: true,
                authorName: true,
                createdAt: true,
              },
              orderBy: (c, ops) => ops.asc(c.createdAt),
              limit: 20,
            },
            tags: {
              with: {
                tag: {
                  columns: { name: true, color: true }
                }
              }
            }
          },
        })

        if (!featureData) {
          return `Feature ${featureId} not found.`
        }

        const tags = featureData.tags.map(t => t.tag.name).join(', ')
        const comments = featureData.comments.length > 0
          ? `\nComments (${featureData.comments.length}):\n${
              featureData.comments.map(c => 
                `  - ${c.authorName || 'Anonymous'}: "${c.content}"`
              ).join('\n')
            }`
          : '\nNo comments yet.'

        return `Feature details:
Title: "${featureData.title}"
Status: ${featureData.status}
Upvotes: ${featureData.upvotesCount}
Tags: ${tags || 'none'}
Description: ${featureData.description || 'No description provided'}
Submitted by: ${featureData.authorName || 'Anonymous'}
${comments}`
      }

      case "get_features_by_tag": {
        const tagsWithFeatures = await databaseDrizzle.query.tag.findMany({
          where: (t, ops) => ops.eq(t.projectId, projectId),
          columns: {
            id: true,
            name: true,
          },
          with: {
            features: {
              with: {
                feature: {
                  columns: {
                    id: true,
                    title: true,
                    upvotesCount: true,
                    status: true,
                  }
                }
              }
            }
          }
        })

        if (tagsWithFeatures.length === 0) {
          return "No tags found for this project. Features may not be categorized yet."
        }

        const formatted = tagsWithFeatures
          .filter(t => t.features.length > 0)
          .sort((a, b) => b.features.length - a.features.length)
          .map(t => {
            const totalUpvotes = t.features.reduce((sum, f) => sum + (f.feature.upvotesCount || 0), 0)
            return `Tag: "${t.name}" — ${t.features.length} features, ${totalUpvotes} total upvotes\n${
              t.features
                .sort((a, b) => (b.feature.upvotesCount || 0) - (a.feature.upvotesCount || 0))
                .slice(0, 3)
                .map(f => `  - "${f.feature.title}" (${f.feature.upvotesCount} upvotes, ${f.feature.status})`)
                .join('\n')
            }`
          }).join('\n\n')

        return `Features grouped by tag:\n\n${formatted}`
      }

      case "get_recent_feedback": {
        const days = toolArgs.days || 30
        const since = new Date()
        since.setDate(since.getDate() - days)

        const recentFeatures = await databaseDrizzle.query.feature.findMany({
          where: (f, ops) => ops.and(
            ops.eq(f.projectId, projectId),
            ops.gte(f.createdAt, since)
          ),
          columns: {
            id: true,
            title: true,
            description: true,
            status: true,
            upvotesCount: true,
            createdAt: true,
          },
          orderBy: (f, ops) => ops.desc(f.createdAt),
          limit: 30,
        })

        if (recentFeatures.length === 0) {
          return `No new feature requests in the last ${days} days.`
        }

        const formatted = recentFeatures.map(f =>
          `- [${f.id}] "${f.title}" — ${f.upvotesCount} upvotes | ${f.status} | submitted ${
            new Date(f.createdAt).toLocaleDateString()
          }`
        ).join('\n')

        return `${recentFeatures.length} feature requests in the last ${days} days:\n${formatted}`
      }

      case "search_features": {
        const { keyword } = toolArgs
        if (!keyword) return "No keyword provided for search."

        // Simple case-insensitive search in title and description
        const allFeatures = await databaseDrizzle.query.feature.findMany({
          where: (f, ops) => ops.eq(f.projectId, projectId),
          columns: {
            id: true,
            title: true,
            description: true,
            status: true,
            upvotesCount: true,
          },
        })

        const lowerKeyword = keyword.toLowerCase()
        const matches = allFeatures.filter(f =>
          f.title.toLowerCase().includes(lowerKeyword) ||
          (f.description?.toLowerCase().includes(lowerKeyword))
        )

        if (matches.length === 0) {
          return `No features found matching "${keyword}".`
        }

        const formatted = matches
          .sort((a, b) => b.upvotesCount - a.upvotesCount)
          .map(f => `- [${f.id}] "${f.title}" — ${f.upvotesCount} upvotes | ${f.status}`)
          .join('\n')

        return `${matches.length} features matching "${keyword}":\n${formatted}`
      }

      default:
        return `Unknown tool: ${toolName}`
    }

  } catch (error) {
    console.error(`[Tool:${toolName}] Error:`, error)
    return `Error executing ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}
