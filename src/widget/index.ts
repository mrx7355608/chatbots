import type { WidgetConfig } from "./types";
import { fetchWidgetConfig } from "./api";
import { createChat } from "./chat";
import { getStyles } from "./styles";

interface ChatBotGlobal {
  init(config: WidgetConfig): void;
}

const ChatBot: ChatBotGlobal = {
  async init(config: WidgetConfig) {
    const { botId, position = "bottom-right" } = config;

    if (!botId) {
      console.error("[ChatBot] botId is required");
      return;
    }

    // Prevent double init
    if (document.getElementById(`chatbot-widget-${botId}`)) return;

    // Create container with Shadow DOM
    const container = document.createElement("div");
    container.id = `chatbot-widget-${botId}`;
    document.body.appendChild(container);

    const shadow = container.attachShadow({ mode: "open" });

    // Inject styles
    const style = document.createElement("style");
    style.textContent = getStyles();
    shadow.appendChild(style);

    try {
      const theme = await fetchWidgetConfig(botId);
      createChat(shadow, botId, theme, position);
    } catch (err) {
      console.error("[ChatBot] Failed to initialize:", err);
    }
  },
};

// Expose globally
(window as unknown as Record<string, unknown>).ChatBot = ChatBot;

export default ChatBot;
