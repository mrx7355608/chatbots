import { useState, useRef, useEffect, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, Bot, User, Loader2, X } from "lucide-react";
import Markdown from "react-markdown";

interface Message {
  role: "user" | "bot";
  content: string;
}

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_MESSAGING ?? "";
const IMAGE_RE = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

function ImageLightbox({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className="my-1 h-32 w-auto cursor-pointer rounded border object-cover transition-opacity hover:opacity-80"
        onClick={() => setOpen(true)}
      />
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

const markdownComponents: ComponentProps<typeof Markdown>["components"] = {
  a({ href, children }) {
    if (href && IMAGE_RE.test(href)) {
      return <ImageLightbox src={href} alt={String(children)} />;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
        {children}
      </a>
    );
  },
  img({ src, alt }) {
    if (src) {
      return <ImageLightbox src={src} alt={alt ?? ""} />;
    }
    return null;
  },
  ul({ children }) {
    return <ul className="my-2 ml-4 list-disc space-y-4">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-2 ml-4 list-decimal space-y-4">{children}</ol>;
  },
  p({ children }) {
    return <p className="my-2">{children}</p>;
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  code({ children }) {
    return <code className="rounded bg-background/50 px-1 py-0.5 text-xs">{children}</code>;
  },
  pre({ children }) {
    return <pre className="my-1 overflow-x-auto rounded bg-background/50 p-2 text-xs">{children}</pre>;
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>;
  },
};

export function ChatTab({ botId }: { botId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(crypto.randomUUID());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, sessionId: sessionIdRef.current, message: text }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      const reply = typeof data === "string" ? data : data.output ?? data.message ?? data.response ?? JSON.stringify(data);
      setMessages((prev) => [...prev, { role: "bot", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", content: "Something went wrong. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[500px] flex-col rounded-lg border bg-background">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Send a message to test your bot.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {msg.role === "bot" ? (
                <Markdown components={markdownComponents}>
                  {msg.content
                    .replace(/\\n/g, "\n")       // literal \n from API → real newlines
                    .replace(/\n(?!\n)/g, "  \n") // single newlines → markdown hard breaks
                  }
                </Markdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-lg bg-muted px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            autoFocus
          />
          <Button type="submit" size="icon" disabled={sending || !input.trim()} className="shrink-0 cursor-pointer">
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
