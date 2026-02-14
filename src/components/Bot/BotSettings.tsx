import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import type { Bot } from "@/types";

interface BotSettingsProps {
  bot: Bot;
  onUpdate: (updates: Partial<Pick<Bot, "name" | "website_url">>) => Promise<void>;
  onDelete: () => void;
}

export function BotSettings({ bot, onUpdate, onDelete }: BotSettingsProps) {
  const [name, setName] = useState(bot.name);
  const [websiteUrl, setWebsiteUrl] = useState(bot.website_url);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      await onUpdate({ name: name.trim(), website_url: websiteUrl.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update bot");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>Bot settings updated.</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="botName">Bot name</Label>
          <Input
            id="botName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input
            id="websiteUrl"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={saving} className="cursor-pointer">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">
          Deleting this bot will permanently remove it and all associated data.
          This action cannot be undone.
        </p>
        <Button variant="destructive" onClick={onDelete} className="cursor-pointer">
          Delete Bot
        </Button>
      </div>
    </div>
  );
}
