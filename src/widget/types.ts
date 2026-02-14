export interface WidgetConfig {
  botId: string;
  position?: "bottom-right" | "bottom-left";
}

export interface WidgetTheme {
  headerColor: string;
  userBubbleColor: string;
  botBubbleColor: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface WidgetMessage {
  role: "user" | "bot";
  content: string;
}
