// lib/billing/limits.ts
import { Authorization, Plan } from "./types";

export const authorization: Record<Plan, Authorization> = {
  FREE: {
    project: 1,
    teamInvite: 1,
    featureRequest: 10,
    productAdvisor_tokens: 50_000,
  },
  STARTER: {
    project: 1,
    teamInvite: 5,
    featureRequest: 100,
    productAdvisor_tokens: 500_000,
  },
  GROWTH: {
    project: 5,
    teamInvite: 15,
    featureRequest: 200,
    productAdvisor_tokens: 1_000_000,
  },
  SCALE: {
    project: Infinity,
    teamInvite: Infinity,
    featureRequest: Infinity,
    productAdvisor_tokens: 5_000_000,
  },
  OS: {
    project: Infinity,
    teamInvite: Infinity,
    featureRequest: Infinity,
    productAdvisor_tokens: Infinity,
  },
};
