import { databaseDrizzle } from "@/db";
import { PERMISSIONS } from "./config";

export async function getProjectPermission(
  userId: string,
  projectId: string
) {
  const userProject = await databaseDrizzle.query.usersProjects.findFirst({
    where: (up, ops) =>
      ops.and(
        ops.eq(up.userId, userId),
        ops.eq(up.projectId, projectId)
      ),
    columns: { role: true },
  });

  const role = userProject?.role ?? "ANONYMOUS";

  return {
    role,
    permissions: PERMISSIONS[role],
  };
}
