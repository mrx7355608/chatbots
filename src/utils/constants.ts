export const SUBSCRIPTION_TIERS = {
  free: { label: "Free", maxBots: 1, conversationsPerMonth: 100 },
  pro: { label: "Pro", maxBots: 5, conversationsPerMonth: 1000, price: 29 },
  enterprise: { label: "Enterprise", maxBots: -1, conversationsPerMonth: -1, price: 99 },
} as const;

export const BOT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  training: "Training",
  ready: "Ready",
  error: "Error",
};

export const BOT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400",
  training: "bg-blue-500/15 text-blue-400",
  ready: "bg-green-500/15 text-green-400",
  error: "bg-red-500/15 text-red-400",
};
