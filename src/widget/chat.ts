import type { WidgetTheme, WidgetMessage } from "./types";
import { sendMessage } from "./api";

const SEND_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.629a.498.498 0 0 0 .682.627l18.168-8.215a.5.5 0 0 0 0-.904z"/><line x1="6" y1="12" x2="22" y2="12"/></svg>`;
const CHAT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/></svg>`;
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

export function createChat(
  root: ShadowRoot,
  botId: string,
  theme: WidgetTheme,
  position: "bottom-right" | "bottom-left"
) {
  const messages: WidgetMessage[] = [];
  let isOpen = false;
  let sending = false;

  // Set CSS custom properties
  const host = root.host as HTMLElement;
  host.style.setProperty("--cb-header-color", theme.headerColor);
  host.style.setProperty("--cb-user-bubble", theme.userBubbleColor);
  host.style.setProperty("--cb-bot-bubble", theme.botBubbleColor);

  // Determine bot bubble text color
  const botBubbleTextColor = isLightColor(theme.botBubbleColor)
    ? "#18181b"
    : "#ffffff";

  // Toggle button
  const toggle = document.createElement("button");
  toggle.className = `cb-toggle ${position}`;
  toggle.innerHTML = CHAT_ICON;
  toggle.setAttribute("aria-label", "Open chat");
  root.appendChild(toggle);

  // Chat window
  const win = document.createElement("div");
  win.className = `cb-window ${position}`;
  win.innerHTML = `
    <div class="cb-header">
      ${
        theme.avatarUrl
          ? `<img class="cb-avatar" src="${escapeAttr(theme.avatarUrl)}" alt="" />`
          : `<div class="cb-avatar-placeholder">${escapeHtml((theme.displayName || "C")[0].toUpperCase())}</div>`
      }
      <span class="cb-header-name">${escapeHtml(theme.displayName)}</span>
      <button class="cb-close" aria-label="Close chat">${CLOSE_ICON}</button>
    </div>
    <div class="cb-messages">
      <div class="cb-empty">Send a message to start chatting</div>
    </div>
    <div class="cb-input-bar">
      <input class="cb-input" placeholder="Type a message..." />
      <button class="cb-send" disabled aria-label="Send">${SEND_ICON}</button>
    </div>
  `;
  root.appendChild(win);

  // References
  const messagesEl = win.querySelector(".cb-messages") as HTMLDivElement;
  const inputEl = win.querySelector(".cb-input") as HTMLInputElement;
  const sendBtn = win.querySelector(".cb-send") as HTMLButtonElement;
  const closeBtn = win.querySelector(".cb-close") as HTMLButtonElement;

  // Toggle open/close
  function setOpen(open: boolean) {
    isOpen = open;
    win.classList.toggle("open", open);
    toggle.classList.toggle("open", open);
    toggle.innerHTML = open ? CLOSE_ICON : CHAT_ICON;
    toggle.setAttribute("aria-label", open ? "Close chat" : "Open chat");
    if (open) inputEl.focus();
  }

  toggle.addEventListener("click", () => setOpen(!isOpen));
  closeBtn.addEventListener("click", () => setOpen(false));

  // Input handling
  inputEl.addEventListener("input", () => {
    sendBtn.disabled = !inputEl.value.trim() || sending;
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  sendBtn.addEventListener("click", handleSend);

  async function handleSend() {
    const text = inputEl.value.trim();
    if (!text || sending) return;

    // Clear empty state
    const empty = messagesEl.querySelector(".cb-empty");
    if (empty) empty.remove();

    // Add user message
    messages.push({ role: "user", content: text });
    appendMessage("user", text);
    inputEl.value = "";
    sendBtn.disabled = true;
    sending = true;
    inputEl.disabled = true;

    // Show typing indicator
    const typing = document.createElement("div");
    typing.className = "cb-typing";
    typing.innerHTML = `<div class="cb-dot"></div><div class="cb-dot"></div><div class="cb-dot"></div>`;
    messagesEl.appendChild(typing);
    scrollToBottom();

    try {
      const reply = await sendMessage(botId, text);
      messages.push({ role: "bot", content: reply });
      typing.remove();
      appendMessage("bot", reply);
    } catch {
      typing.remove();
      appendMessage("bot", "Something went wrong. Please try again.");
    } finally {
      sending = false;
      inputEl.disabled = false;
      sendBtn.disabled = !inputEl.value.trim();
      inputEl.focus();
    }
  }

  function appendMessage(role: "user" | "bot", content: string) {
    const el = document.createElement("div");
    el.className = `cb-msg cb-msg-${role}`;

    if (role === "bot") {
      el.innerHTML = renderMarkdown(content);
      el.style.color = botBubbleTextColor;
    } else {
      el.textContent = content;
    }

    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

// Simple markdown renderer (no dependencies)
function renderMarkdown(text: string): string {
  let html = escapeHtml(text);

  // Code blocks (```...```)
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Images: ![alt](url)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" />'
  );

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Unordered lists
  html = html.replace(/((?:^|\n)[-*] .+(?:\n[-*] .+)*)/g, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^[-*] /, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^|\n)\d+\. .+(?:\n\d+\. .+)*)/g, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^\d+\. /, "")}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  // Paragraphs (double newline)
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(ul|ol|pre|img)/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join("");

  // Single newlines to <br> (within paragraphs)
  html = html.replace(/([^>])\n([^<])/g, "$1<br>$2");

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
