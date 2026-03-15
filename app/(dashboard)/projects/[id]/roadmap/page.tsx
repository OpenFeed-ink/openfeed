import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { databaseDrizzle } from "@/db";
import { project } from "@/db/schema";
import { RoadmapBoard } from "@/components/RoadmapBoard/RoadmapBoard";

export default async function RoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user.id) redirect("/signin");

  const projectData = await databaseDrizzle.query.project.findFirst({
    where: eq(project.id, id),
    columns: {
      name: true,
      roadmapHiddenColumns: true,
    },
    with: {
      features: {
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
          upvotes: {
            where: (u, ops) =>
              ops.or(
                ops.eq(u.voterToken, session.user.id),
                ops.eq(u.voterEmail, session.user.email)
              ),
            columns: { id: true },
          }
        },
        orderBy: (f, { asc }) => [asc(f.createdAt)],
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
