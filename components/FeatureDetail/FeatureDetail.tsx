import { User } from "better-auth";
import { eq } from "drizzle-orm";
import { feature } from "@/db/schema";
import { FeatureDetailClient } from "./FeatureDetailClient";
import { databaseDrizzle } from "@/db";


export async function FeatureDetail({ featureId, projectId, user, memberships }: {
  featureId: string,
  projectId: string,
  user: User,
  memberships: {
    userId: string;
    role: "ADMIN" | "MEMBER";
  }[]
}) {

  const featureData = await databaseDrizzle.query.feature.findFirst({
    where: eq(feature.id, featureId),
    with: {
      comments: {
        with: {
          author: { columns: { id: true, name: true, image: true } },
          replies: {
            with: { author: { columns: { id: true, name: true, image: true } } }
          }
        },
        orderBy: (comments, { desc }) => [desc(comments.createdAt)]
      },
      upvotes: {
        where: (u, ops) =>
          ops.or(
            ops.eq(u.voterToken, user.id),
            ops.eq(u.voterEmail, user.email)
          ),
        columns: { id: true }
      }
    }
  });

  if (!featureData) return null;

  const canPin = memberships.some(
    (m) => m.userId === user.id && (m.role === "ADMIN" || m.role === "MEMBER")
  );

  return (
    <FeatureDetailClient
      feature={featureData}
      user={user}
      memberships={memberships}
      canPin={canPin}
    />
  );
}
