// lib/billing/guards.ts
import { getAuthorizationWithProject } from "./getAuthorization";
import { Feature } from "./types";

export async function requireFeature(
  userId: string,
  feature: Feature,
  used: number
) {
  const auth = await getAuthorizationWithProject(userId);

  const limit = auth.limits[feature];

  if (used >= limit) {
    throw new Error(
      `Limit reached for ${feature}. Upgrade your plan.`
    );
  }

  return auth;
}
