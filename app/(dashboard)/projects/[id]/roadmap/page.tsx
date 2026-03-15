import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { databaseDrizzle } from "@/db";
import { feature, featureTags, project } from "@/db/schema";
import { RoadmapBoard } from "@/components/RoadmapBoard/RoadmapBoard";
import { FeatureFilters } from "@/components/FeatureFilters/FeatureFilters";


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

export default async function RoadmapPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const {
    status = "all",
    sort = "most-votes",
    q = "",
    tags = "",
  } = await searchParams;
  const tagIds = tags ? tags.split(",").filter(Boolean) : [];


  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/signin");

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

  const projectData = await databaseDrizzle.query.project.findFirst({
    where: eq(project.id, id),
    columns: {
      name: true,
      roadmapHiddenColumns: true,
    },
    with: {
      tags: true,
      features: {
        where: featureWhere,
        columns: {
          id: true,
          title: true,
          description: true,
          upvotesCount: true,
          status: true,
          createdAt: true,
        },
        with: {
          tags: { columns: {}, with: { tag: true } },
          comments: { columns: { id: true } },
        },
        orderBy: (f, { desc, asc }) => {
          if (sort === "most-votes") return desc(f.upvotesCount);
          if (sort === "least-votes") return asc(f.upvotesCount);
          if (sort === "oldest") return asc(f.createdAt);
          return desc(f.createdAt); // newest default
        },
      }
    }
  });
  if (!projectData) notFound();

  const transformedFeatures = projectData.features.map((f) => ({
    id: f.id,
    title: f.title,
    status: f.status,
    description: f.description,
    tags: f.tags.map(t => t.tag),
    upvotesCount: f.upvotesCount,
    commentsCount: f.comments.length,
    createdAt: f.createdAt,
  }));

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <FeatureFilters
        projectId={id}
        currentStatus={status}
        currentSort={sort}
        currentSearch={q}
        currentTags={tagIds}
        availableTags={projectData.tags}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{projectData.name} Roadmap</h1>
        <p className="text-sm text-muted-foreground">
          Drag and drop items to update status
        </p>
      </div>
      <RoadmapBoard
        features={transformedFeatures}
        projectId={id}
        userId={session.user.id}
        hiddenColumns={projectData.roadmapHiddenColumns}
        allowed={true}
      />
    </div>
  );
}
