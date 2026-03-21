import { faker } from "@faker-js/faker";
import { databaseDrizzle } from "@/db";
import { feature, comment, upvote, tag, featureTags } from "@/db/schema";
import { eq } from "drizzle-orm";

const PROJECT_ID = "ShQyxCnubmpQnTr5986T2";
const USER_IDS = ["vlxKbA56HC9Sel3OCuNscJPEmdShbsaZ"];
const VISITOR_COUNT = 200;
const visitors = Array.from({ length: VISITOR_COUNT }).map(() => faker.string.uuid());

function pickActor(userIds: string[], visitors: string[]) {
  const isUser = Math.random() > 0.3;
  return isUser
    ? { authorId: faker.helpers.arrayElement(userIds), visitorToken: null }
    : { authorId: null, visitorToken: faker.helpers.arrayElement(visitors) };
}

async function seed() {
  console.log("🌱 Seeding started...");

  const projectTags = await databaseDrizzle.query.tag.findMany({
    where: eq(tag.projectId, PROJECT_ID),
  });

  const FEATURES_COUNT = 200;

  for (let i = 0; i < FEATURES_COUNT; i++) {
    const { authorId, visitorToken } = pickActor(USER_IDS, visitors);

    const [{ featureId }] = await databaseDrizzle
      .insert(feature)
      .values({
        projectId: PROJECT_ID,
        title: faker.hacker.phrase(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement([
          "under_review", "planned", "in_progress", "done", "closed",
        ]),
        authorId,
        visitorToken,
        authorName: faker.person.fullName(),
        authorEmail: faker.internet.email(),
      })
      .returning({ featureId: feature.id });

    // Tags
    if (projectTags.length > 0) {
      const randomTags = faker.helpers.arrayElements(
        projectTags,
        faker.number.int({ min: 0, max: Math.min(4, projectTags.length) })
      );
      for (const t of randomTags) {
        await databaseDrizzle.insert(featureTags).values({ featureId, tagId: t.id });
      }
    }

    // Comments (nested) — fix: only pick parentId if commentIds is non-empty
    const COMMENTS_COUNT = faker.number.int({ min: 0, max: 15 });
    const commentIds: string[] = [];

    for (let j = 0; j < COMMENTS_COUNT; j++) {
      const { authorId: cAuthorId, visitorToken: cVisitorToken } = pickActor(USER_IDS, visitors);

      // Only nest if there are existing comments to nest under
      const parentId =
        commentIds.length > 0 && Math.random() > 0.7
          ? faker.helpers.arrayElement(commentIds)
          : null;

      const [{ commentId }] = await databaseDrizzle
        .insert(comment)
        .values({
          featureId,
          content: faker.lorem.sentences(2),
          authorName: faker.person.fullName(),
          authorId: cAuthorId,
          visitorToken: cVisitorToken,
          parentId,
        })
        .returning({ commentId: comment.id });

      commentIds.push(commentId);
    }

    // Upvotes
    const UPVOTES_COUNT = faker.number.int({ min: 0, max: 150 });
    const usedVoters = new Set<string>();

    for (let k = 0; k < UPVOTES_COUNT; k++) {
      const voter = faker.helpers.arrayElement(visitors);
      if (usedVoters.has(voter)) continue;
      usedVoters.add(voter);
      await databaseDrizzle.insert(upvote).values({ featureId, voterToken: voter });
    }

    await databaseDrizzle
      .update(feature)
      .set({ upvotesCount: usedVoters.size })
      .where(eq(feature.id, featureId));

    if (i % 10 === 0) console.log(`✅ Created ${i + 1} features`);
  }

  console.log("🎉 Seeding finished");
}

seed();
