const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL ?? "";

export async function triggerBotTraining(botId: string, websiteUrl: string) {
  const response = await fetch(`${N8N_WEBHOOK_URL}/train-bot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ botId, websiteUrl }),
  });

  if (!response.ok) {
    throw new Error("Failed to trigger bot training");
  }

  return response.json();
}

export async function triggerBotRetrain(botId: string, websiteUrl: string) {
  const response = await fetch(`${N8N_WEBHOOK_URL}/retrain-bot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ botId, websiteUrl }),
  });

  if (!response.ok) {
    throw new Error("Failed to trigger bot retraining");
  }

  return response.json();
}

export async function getBotTrainingStatus(botId: string) {
  const response = await fetch(`${N8N_WEBHOOK_URL}/bot-status/${botId}`);

  if (!response.ok) {
    throw new Error("Failed to get bot status");
  }

  return response.json();
}
