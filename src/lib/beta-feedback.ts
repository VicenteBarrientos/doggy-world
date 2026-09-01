export const betaFeedbackCategories = [
  "Algo no funciona",
  "No entendí algo",
  "Tengo una idea",
  "Me gustó algo",
  "Otro",
] as const;

export type BetaFeedbackCategory = (typeof betaFeedbackCategories)[number];
