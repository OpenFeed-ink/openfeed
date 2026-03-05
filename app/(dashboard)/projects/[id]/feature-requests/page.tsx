import { notFound } from "next/navigation";
import { databaseDrizzle } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from 'next/navigation'
import { UpsertFeature } from "@/components/UpsertFeature/UpsertFeature";
import { UpvoteProvider } from "@/contexts/UpvoteProvider";
import { isUUID } from "@/lib/utils";
import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { feature, featureTags, project, usersProjects } from "@/db/schema";
import { FeatureFilters } from "@/components/FeatureFilters/FeatureFilters";
import { FeatureList } from "@/components/FeatureLists/FeatureList";
import { FeatureDetail } from "@/components/FeatureDetail/FeatureDetail";


interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    status?: string;
    sort?: "most-votes" | "least-votes" | "newest" | "oldest";
    q?: string;
    tags?: string; // comma-separated tag IDs
    page?: string;
    featureId?: string;
  }>;
}

export interface QFeature {
    id: string;
    createdAt: Date;
    description: string | null;
    projectId: string;
    title: string;
    status: "under_review" | "planned" | "in_progress" | "done" | "closed";
    upvotesCount: number;
    authorName: string | null;
    authorEmail: string | null;
    authorId: string | null;
    aiSummary: string | null;
    priorityScore: number | null;
    upvotes: {
        id: string;
    }[];
    comments: {
        id: string;
    }[];
    tags: {
        featureId: string;
        tagId: string;
        tag: {
            id: string;
            name: string;
            createdAt: Date;
            projectId: string;
            color: string;
        };
    }[];

}



export default async function ProjectFeedbackPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const {
    status = "all",
    sort = "most-votes",
    q = "",
    tags = "",
    page = "1",
    featureId,
  } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) return redirect("/signin");

  const currentPage = parseInt(page) || 1;
  const pageSize = 10;
  const tagIds = tags ? tags.split(",").filter(Boolean) : [];

  // Fetch project and its tags
  const projectData = await databaseDrizzle.query.project.findFirst({
    where: eq(project.id, id),
    columns: { name: true },
    with: { tags: true },
  });
  if (!projectData) return notFound();

  // Build where clause for features
  const featureWhere = and(
    eq(feature.projectId, id),
    status !== "all" ? eq(feature.status, status as any) : undefined,
    q
      ? or(
          ilike(feature.title, `%${q}%`),
          ilike(feature.description, `%${q}%`)
        )
      : undefined,
    tagIds.length > 0
      ? inArray(
          feature.id,
          databaseDrizzle
            .select({ featureId: featureTags.featureId })
            .from(featureTags)
            .where(inArray(featureTags.tagId, tagIds))
        )
      : undefined
  );

  // Fetch features with pagination
  const features = await databaseDrizzle.query.feature.findMany({
    where: featureWhere,
    orderBy: (f, { desc, asc }) => {
      if (sort === "most-votes") return desc(f.upvotesCount);
      if (sort === "least-votes") return asc(f.upvotesCount);
      if (sort === "oldest") return asc(f.createdAt);
      return desc(f.createdAt); // newest default
    },
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    with: {
      comments: { columns: { id: true } }, // only count for list
      upvotes: {
        where: (u, ops) =>
          ops.or(
            ops.eq(u.voterToken, session.user.id),
            ops.eq(u.voterEmail, session.user.email)
          ),
        columns: { id: true },
      },
      tags: { with: { tag: true } },
    },
  });

  // Count total for pagination
  const totalCountResult = await databaseDrizzle
    .select({ count: sql<number>`count(*)` })
    .from(feature)
    .where(featureWhere)
    .limit(1);
  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get memberships for role checking
  const memberships = await databaseDrizzle.query.usersProjects.findMany({
    where: eq(usersProjects.projectId, id),
    columns: { userId: true, role: true },
  });

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {projectData.name} Feature Request ({totalCount})
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and respond to user feedback
          </p>
        </div>
        <UpsertFeature projectId={id} availableTags={projectData.tags} />
      </div>

      {/* Filters */}
      <FeatureFilters
        projectId={id}
        currentStatus={status}
        currentSort={sort}
        currentSearch={q}
        currentTags={tagIds}
        availableTags={projectData.tags}
      />

      {/* Split panel with UpvoteProvider */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6">
        <UpvoteProvider
          initialVotes={Object.fromEntries(
            features.map((f) => [
              f.id,
              { voted: f.upvotes.length > 0, count: f.upvotesCount },
            ])
          )}
        >
          {/* Left panel - Feedback list */}
          <div className="lg:col-span-1">
            <FeatureList
              features={features}
              totalPages={totalPages}
              currentPage={currentPage}
              selectedFeatureId={featureId}
            />
          </div>

          {/* Right panel - Feedback detail */}
          <div className="lg:col-span-2">
            {featureId && isUUID(featureId) ? (
              <FeatureDetail
                featureId={featureId}
                user={session.user}
                projectId={id}
                memberships={memberships}
              />
            ) : (
              <div className="flex h-full min-h-100 items-center justify-center rounded-lg border bg-card p-8 text-center">
                <div>
                  <div className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No Feature Request selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a Feature Request item to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </UpvoteProvider>
      </div>
    </div>
  );
}
