// lib/billing/guards.ts
import { getAuthorization } from "./getAuthorization";
import { Feature } from "./types";

export async function requireFeature(
  userId: string,
  feature: Feature,
  used: number
) {
  const auth = await getAuthorization(userId);

  const limit = auth.limits[feature];

  if (used >= limit) {
    throw new Error(
      `Limit reached for ${feature}. Upgrade your plan.`
    );
  }

  return auth;
}
