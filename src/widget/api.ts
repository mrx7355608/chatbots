import type { WidgetTheme } from "./types";

declare const __WIDGET_SUPABASE_URL__: string;
declare const __WIDGET_SUPABASE_ANON_KEY__: string;
declare const __WIDGET_WEBHOOK_URL__: string;

const SUPABASE_URL = __WIDGET_SUPABASE_URL__;
const SUPABASE_ANON_KEY = __WIDGET_SUPABASE_ANON_KEY__;
const WEBHOOK_URL = __WIDGET_WEBHOOK_URL__;

export async function fetchWidgetConfig(botId: string): Promise<WidgetTheme> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_widget_config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ bot_id_input: botId }),
  });

  if (!res.ok) throw new Error("Failed to load widget config");

  const data = await res.json();
  return {
    headerColor: data.widget_header_color ?? "#18181b",
    userBubbleColor: data.widget_user_bubble_color ?? "#18181b",
    botBubbleColor: data.widget_bot_bubble_color ?? "#f4f4f5",
    displayName: data.widget_display_name ?? data.name ?? "Chat Assistant",
    avatarUrl: data.widget_avatar_url ?? null,
  };
}

export async function sendMessage(
  botId: string,
  message: string
): Promise<string> {
  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ botId, message }),
  });

  if (!res.ok) throw new Error("Failed to send message");

  const data = await res.json();
  return typeof data === "string"
    ? data
    : data.output ?? data.message ?? data.response ?? JSON.stringify(data);
}
