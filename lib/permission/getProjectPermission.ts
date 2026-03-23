import { databaseDrizzle } from "@/db";
import { PERMISSIONS } from "./config";

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

export async function getProjectUserPermission(userId: string, projectId: string) {
  const user = await databaseDrizzle.query.usersProjects.findFirst({
    where: (up, ops) => ops.and(ops.eq(up.userId, userId), ops.eq(up.projectId, projectId)),
    columns: { role: true }
  })
  if (!user) return PERMISSIONS['ANONYMOUS']

  return PERMISSIONS[user.role]
}
