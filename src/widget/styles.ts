export function getStyles(): string {
  return `
    :host {
      display: block !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 0 !important;
      height: 0 !important;
      overflow: visible !important;
      z-index: 2147483647 !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: none !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #18181b;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .cb-toggle {
      position: fixed;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 2147483647;
      background-color: var(--cb-header-color, #18181b);
      color: #fff;
      pointer-events: auto;
    }
    .cb-toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    }
    .cb-toggle.bottom-right { bottom: 20px; right: 20px; }

    .cb-toggle svg {
      width: 24px;
      height: 24px;
      transition: transform 0.2s;
    }
    .cb-toggle.open svg { transform: rotate(90deg); }

    .cb-window {
      position: fixed;
      width: 380px;
      height: 520px;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      z-index: 2147483646;
      background: #ffffff;
      opacity: 0;
      transform: translateY(16px) scale(0.95);
      pointer-events: none !important;
      transition: opacity 0.2s, transform 0.2s;
    }
    .cb-window.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto !important;
    }
    .cb-window.bottom-right { bottom: 88px; right: 20px; }

    @media (max-width: 440px) {
      .cb-window {
        width: calc(100vw - 16px);
        height: calc(100vh - 100px);
        right: 8px !important;
        left: 8px !important;
        bottom: 80px;
        border-radius: 12px;
      }
    }

    .cb-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background-color: var(--cb-header-color, #18181b);
      color: #fff;
      flex-shrink: 0;
    }

    .cb-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .cb-avatar-placeholder {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .cb-header-name {
      font-weight: 600;
      font-size: 15px;
    }

    .cb-close {
      margin-left: auto;
      background: rgba(255,255,255,0.15);
      border: none;
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .cb-close:hover { background: rgba(255,255,255,0.25); }
    .cb-close svg { width: 16px; height: 16px; }

    .cb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cb-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .cb-msg a { color: inherit; text-decoration: underline; }
    .cb-msg a:hover { text-decoration: none; }
    .cb-msg ul, .cb-msg ol { margin: 10px 0 10px 18px; }
    .cb-msg li { margin-bottom: 10px; }
    .cb-msg li:last-child { margin-bottom: 0; }
    .cb-msg p { margin: 8px 0; }
    .cb-msg p:first-child { margin-top: 0; }
    .cb-msg p:last-child { margin-bottom: 0; }
    .cb-msg code {
      background: rgba(0,0,0,0.06);
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 13px;
    }
    .cb-msg pre {
      background: rgba(0,0,0,0.06);
      padding: 8px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 4px 0;
      font-size: 13px;
    }
    .cb-msg strong { font-weight: 600; }
    .cb-msg img {
      max-width: 100%;
      border-radius: 6px;
      margin: 4px 0;
    }

    .cb-msg-user {
      align-self: flex-end;
      background-color: var(--cb-user-bubble, #18181b);
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    .cb-msg-bot {
      align-self: flex-start;
      background-color: var(--cb-bot-bubble, #f4f4f5);
      border-bottom-left-radius: 4px;
    }

    .cb-typing {
      align-self: flex-start;
      background-color: var(--cb-bot-bubble, #f4f4f5);
      padding: 10px 14px;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      display: flex;
      gap: 4px;
    }
    .cb-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(0,0,0,0.3);
      animation: cb-bounce 1.2s infinite;
    }
    .cb-dot:nth-child(2) { animation-delay: 0.15s; }
    .cb-dot:nth-child(3) { animation-delay: 0.3s; }

    @keyframes cb-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }

    .cb-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a1a1aa;
      font-size: 13px;
      text-align: center;
      padding: 20px;
    }

    .cb-input-bar {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e4e4e7;
      background: #fff;
      flex-shrink: 0;
    }

    .cb-input {
      flex: 1;
      border: 1px solid #e4e4e7;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 14px;
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s;
    }
    .cb-input:focus { border-color: var(--cb-header-color, #18181b); }
    .cb-input::placeholder { color: #a1a1aa; }
    .cb-input:disabled { opacity: 0.5; }

    .cb-send {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--cb-header-color, #18181b);
      color: #fff;
      flex-shrink: 0;
      transition: opacity 0.15s;
    }
    .cb-send:disabled { opacity: 0.4; cursor: default; }
    .cb-send svg { width: 18px; height: 18px; }

    .cb-powered {
      text-align: center;
      padding: 6px;
      font-size: 11px;
      color: #a1a1aa;
      background: #fff;
      border-top: 1px solid #f4f4f5;
    }
  `;
}
