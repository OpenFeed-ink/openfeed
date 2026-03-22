import { databaseDrizzle } from "@/db";

export async function getProjectPermission(
  projectId: string
) {
  const userProject = await databaseDrizzle.query.usersProjects.findMany({
    where: (up, ops) =>
      ops.eq(up.projectId, projectId),
    columns: { role: true, userId: true },
  });
  return {
    permissions: userProject,
  };
}
