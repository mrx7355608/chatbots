const TRAINING_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_TRAINING ?? "";

export interface TrainingWebhookParams {
  botId: string;
  websiteUrl: string;
  userEmail: string;
  botName: string;
  integrationTabUrl: string;
}

export async function triggerBotTraining(params: TrainingWebhookParams) {
  const res = await fetch(TRAINING_WEBHOOK_URL, {
    method: "POST",
    body: new URLSearchParams({
      botId: params.botId,
      websiteUrl: params.websiteUrl,
      userEmail: params.userEmail,
      botName: params.botName,
      integrationTabUrl: params.integrationTabUrl,
    }),
  });
  if (!res.ok) throw new Error("Failed to start training");
}
