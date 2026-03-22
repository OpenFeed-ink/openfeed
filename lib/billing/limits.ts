// lib/billing/limits.ts
import { Authorization, Plan } from "./types";

export const authorization: Record<Plan, Authorization> = {
  FREE: {
    project: 1,
    teamInvite: 5,
    featureRequest: 500,
    productAdvisor: 1,
  },
  STARTER: {
    project: 1,
    teamInvite: 5,
    featureRequest: 100,
    productAdvisor: 10,
  },
  GROWTH: {
    project: 5,
    teamInvite: 15,
    featureRequest: 200,
    productAdvisor: 20,
  },
  SCALE: {
    project: Infinity,
    teamInvite: Infinity,
    featureRequest: Infinity,
    productAdvisor: 100,
  },
  OS: {
    project: Infinity,
    teamInvite: Infinity,
    featureRequest: Infinity,
    productAdvisor: Infinity,
  },
};
