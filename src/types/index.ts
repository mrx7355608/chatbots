export interface User {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  subscription_tier: "free" | "pro" | "enterprise";
  max_bots: number;
}

export type BotStatus = "pending" | "training" | "ready" | "error";
export type EmbeddingStatus = "not_started" | "in_progress" | "completed" | "failed";

export interface Bot {
  id: string;
  user_id: string;
  name: string;
  website_url: string;
  status: BotStatus;
  created_at: string;
  updated_at: string;
  last_trained_at: string | null;
  integration_code: string | null;
  n8n_workflow_id: string | null;
  total_pages_scraped: number;
  embedding_status: EmbeddingStatus;
  widget_header_color: string | null;
  widget_user_bubble_color: string | null;
  widget_bot_bubble_color: string | null;
  widget_display_name: string | null;
  widget_avatar_url: string | null;
}

export interface BotAnalytics {
  id: string;
  bot_id: string;
  conversations_count: number;
  messages_count: number;
  last_used_at: string | null;
  date: string;
}

export interface CreateBotInput {
  name: string;
  website_url: string;
}
