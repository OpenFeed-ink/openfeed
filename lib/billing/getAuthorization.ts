import { authorization } from "./limits";
import { Plan } from "./types";
import { databaseDrizzle } from "@/db";

const TRIAL_DAYS = 7;

export async function getAuthorization(userId: string) {
  const user = await databaseDrizzle.query.user.findFirst({
    where: (u, ops) => ops.eq(u.id, userId),
    columns: {
      createdAt: true,
      plan: true,
    },
  });

  if (!user) throw new Error("User not found");

  const now = new Date();
  const diffTime = now.getTime() - new Date(user.createdAt).getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const isTrial = user.plan === "FREE" && diffDays <= TRIAL_DAYS;

  const effectivePlan: Plan = isTrial ? "STARTER" : user.plan;

  return {
    plan: effectivePlan,
    isTrial,
    limits: authorization[effectivePlan],
    daysLeft: isTrial ? TRIAL_DAYS - diffDays : 0,
  };
}
