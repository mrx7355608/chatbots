import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, X } from "lucide-react";
import { uploadBotAvatar } from "@/services/botService";
import type { Bot } from "@/types";

type WidgetFields =
  | "widget_header_color"
  | "widget_user_bubble_color"
  | "widget_bot_bubble_color"
  | "widget_display_name"
  | "widget_avatar_url";

interface WidgetCustomizationProps {
  bot: Bot;
  onUpdate: (updates: Partial<Pick<Bot, WidgetFields>>) => Promise<void>;
}

export function WidgetCustomization({ bot, onUpdate }: WidgetCustomizationProps) {
  const [displayName, setDisplayName] = useState(bot.widget_display_name ?? "Chat Assistant");
  const [headerColor, setHeaderColor] = useState(bot.widget_header_color ?? "#18181b");
  const [userBubbleColor, setUserBubbleColor] = useState(bot.widget_user_bubble_color ?? "#18181b");
  const [botBubbleColor, setBotBubbleColor] = useState(bot.widget_bot_bubble_color ?? "#f4f4f5");
  const [avatarUrl, setAvatarUrl] = useState(bot.widget_avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      await onUpdate({
        widget_display_name: displayName.trim(),
        widget_header_color: headerColor,
        widget_user_bubble_color: userBubbleColor,
        widget_bot_bubble_color: botBubbleColor,
        widget_avatar_url: avatarUrl || null,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update widget");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadBotAvatar(bot.id, file);
      setAvatarUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isBotBubbleLight = isLightColor(botBubbleColor);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>Widget appearance updated.</AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-muted-foreground">
        Customize how the chat widget looks on your website.
      </p>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Chat Assistant"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="headerColor">Header Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="headerColor"
              value={headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
            />
            <Input
              value={headerColor}
              onChange={(e) => setHeaderColor(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="userBubbleColor">User Message Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="userBubbleColor"
              value={userBubbleColor}
              onChange={(e) => setUserBubbleColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
            />
            <Input
              value={userBubbleColor}
              onChange={(e) => setUserBubbleColor(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="botBubbleColor">Bot Message Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="botBubbleColor"
              value={botBubbleColor}
              onChange={(e) => setBotBubbleColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
            />
            <Input
              value={botBubbleColor}
              onChange={(e) => setBotBubbleColor(e.target.value)}
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Avatar Upload */}
      <div className="space-y-2">
        <Label>Bot Avatar</Label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Bot avatar"
                className="h-16 w-16 rounded-full border object-cover"
              />
              <button
                type="button"
                onClick={() => setAvatarUrl("")}
                className="absolute -top-1 -right-1 cursor-pointer rounded-full bg-destructive p-0.5 text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25">
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <Upload className="mr-2 h-3 w-3" />
              )}
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              Recommended: 128x128px, PNG or JPG
            </p>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-2">
        <Label>Preview</Label>
        <div className="overflow-hidden rounded-lg border">
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ backgroundColor: headerColor }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                {(displayName || "C")[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-white">
              {displayName || "Chat Assistant"}
            </span>
          </div>
          {/* Messages */}
          <div className="space-y-2 bg-white p-3">
            <div className="flex justify-start">
              <div
                className="max-w-[70%] rounded-lg px-3 py-2 text-sm"
                style={{
                  backgroundColor: botBubbleColor,
                  color: isBotBubbleLight ? "#18181b" : "#ffffff",
                }}
              >
                Hi! How can I help you today?
              </div>
            </div>
            <div className="flex justify-end">
              <div
                className="max-w-[70%] rounded-lg px-3 py-2 text-sm text-white"
                style={{ backgroundColor: userBubbleColor }}
              >
                Tell me about your product
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={saving} className="cursor-pointer">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Widget Appearance
      </Button>
    </form>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
