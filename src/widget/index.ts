import type { WidgetConfig } from "./types";
import { fetchWidgetConfig } from "./api";
import { createChat } from "./chat";
import { getStyles } from "./styles";

console.log("[ChatBot] widget.js loaded");

// Global dedup: prevent multiple script loads from double-initializing
const _initedBots = ((window as unknown as Record<string, unknown>).__chatbot_inited as Set<string>) ??
  new Set<string>();
(window as unknown as Record<string, unknown>).__chatbot_inited = _initedBots;

interface ChatBotGlobal {
  init(config: WidgetConfig): void;
}

const ChatBot: ChatBotGlobal = {
  async init(config: WidgetConfig) {
    const { botId } = config;
    console.log("[ChatBot] init called with botId:", botId);

    if (!botId) {
      console.error("[ChatBot] botId is required");
      return;
    }

    // Prevent double init (sync flag + DOM check)
    if (_initedBots.has(botId) || document.getElementById(`chatbot-widget-${botId}`)) {
      console.log("[ChatBot] already initialized, skipping");
      return;
    }
    _initedBots.add(botId);

    // Create container with Shadow DOM
    const container = document.createElement("div");
    container.id = `chatbot-widget-${botId}`;
    // Inline styles ensure the host is visible regardless of page CSS
    container.setAttribute("style",
      "display:block!important;position:fixed!important;top:0!important;left:0!important;" +
      "width:0!important;height:0!important;overflow:visible!important;" +
      "z-index:2147483647!important;opacity:1!important;visibility:visible!important;" +
      "pointer-events:none!important;padding:0!important;margin:0!important;border:none!important;"
    );
    document.body.appendChild(container);

    const shadow = container.attachShadow({ mode: "open" });

    // Inject styles
    const style = document.createElement("style");
    style.textContent = getStyles();
    shadow.appendChild(style);

    try {
      console.log("[ChatBot] fetching widget config...");
      const theme = await fetchWidgetConfig(botId);
      console.log("[ChatBot] config loaded, creating chat UI");
      createChat(shadow, botId, theme);
    } catch (err) {
      console.error("[ChatBot] Failed to initialize:", err);
    }
  },
};

// Expose globally
(window as unknown as Record<string, unknown>).ChatBot = ChatBot;

// Auto-initialize: check script URL for ?botId=, data-bot-id attr, or global config
(function autoInit() {
  const scripts = document.querySelectorAll<HTMLScriptElement>("script[src*='widget.js']");
  console.log("[ChatBot] auto-init: found", scripts.length, "widget script(s)");

  for (const s of scripts) {
    console.log("[ChatBot] checking script src:", s.src);
    const url = new URL(s.src, location.href);
    const botId = url.searchParams.get("botId");
    if (botId) { console.log("[ChatBot] found botId in URL:", botId); ChatBot.init({ botId }); return; }
    const attr = s.getAttribute("data-bot-id");
    if (attr) { console.log("[ChatBot] found data-bot-id:", attr); ChatBot.init({ botId: attr }); return; }
  }

  const cfg = (window as unknown as Record<string, unknown>).ChatBotConfig as WidgetConfig | undefined;
  if (cfg?.botId) { console.log("[ChatBot] found global config:", cfg.botId); ChatBot.init(cfg); return; }

  console.warn("[ChatBot] no botId found — widget not initialized");
})();

export default ChatBot;
