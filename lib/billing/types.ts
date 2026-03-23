export type Plan = "FREE" | "STARTER" | "GROWTH" | "SCALE" | "OS";

export type Feature =
  | "project"
  | "teamInvite"
  | "featureRequest"
  | "productAdvisor_tokens";

export type Authorization = Record<Feature, number>;
