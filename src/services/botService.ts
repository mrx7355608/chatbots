import { supabase } from "./supabaseClient";
import type { Bot, CreateBotInput } from "@/types";

export async function getBots(): Promise<Bot[]> {
  const { data, error } = await supabase
    .from("bots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBot(botId: string): Promise<Bot> {
  const { data, error } = await supabase
    .from("bots")
    .select("*")
    .eq("id", botId)
    .single();

  if (error) throw error;
  return data;
}

export async function createBot(input: CreateBotInput): Promise<Bot> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const integrationCode = generateIntegrationCode("PLACEHOLDER_ID");

  const { data, error } = await supabase
    .from("bots")
    .insert({
      user_id: user.id,
      name: input.name,
      website_url: input.website_url,
      integration_code: integrationCode,
    })
    .select()
    .single();

  if (error) throw error;

  // Update integration code with actual bot ID
  const updatedCode = generateIntegrationCode(data.id);
  await supabase
    .from("bots")
    .update({ integration_code: updatedCode })
    .eq("id", data.id);

  return { ...data, integration_code: updatedCode };
}

export async function deleteBot(botId: string): Promise<void> {
  const { error } = await supabase.from("bots").delete().eq("id", botId);
  if (error) throw error;
}

export async function uploadBotAvatar(botId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${botId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("bot-avatars")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("bot-avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function updateBot(
  botId: string,
  updates: Partial<
    Pick<
      Bot,
      | "name"
      | "website_url"
      | "widget_header_color"
      | "widget_user_bubble_color"
      | "widget_bot_bubble_color"
      | "widget_display_name"
      | "widget_avatar_url"
    >
  >
): Promise<Bot> {
  const { data, error } = await supabase
    .from("bots")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", botId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

function generateIntegrationCode(botId: string): string {
  const widgetUrl =
    import.meta.env.VITE_CHAT_WIDGET_URL ?? "https://yourdomain.com/widget.js";
  return `<script src="${widgetUrl}"></script>
<script>
  ChatBot.init({ botId: '${botId}' });
</script>`;
}
