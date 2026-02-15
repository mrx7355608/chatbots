export interface WidgetConfig {
  botId: string;
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
