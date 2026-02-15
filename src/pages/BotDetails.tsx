import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/Common/DashboardLayout";
import { TrainingStatus } from "@/components/Bot/TrainingStatus";
import { IntegrationCode } from "@/components/Bot/IntegrationCode";
import { BotSettings } from "@/components/Bot/BotSettings";
import { WidgetCustomization } from "@/components/Bot/WidgetCustomization";
import { ChatTab } from "@/components/Bot/ChatTab";
import { useBot } from "@/hooks/useBots";
import { useAuth } from "@/hooks/useAuth";
import type { Bot } from "@/types";
import * as botService from "@/services/botService";
import { triggerBotTraining } from "@/services/n8nService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ExternalLink,
  Play,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function BotDetails() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { bot, setBot, loading, error } = useBot(botId!);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const validTabs = ["overview", "chat", "widget", "integration", "settings"] as const;
  type TabValue = (typeof validTabs)[number];
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabValue>(
    validTabs.includes(tabFromUrl as TabValue)
      ? (tabFromUrl as TabValue)
      : "overview"
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
    setSearchParams({ tab: value }, { replace: true });
  };

  const buildIntegrationTabUrl = (id: string) =>
    `${window.location.origin}/bot/${id}?tab=integration`;

  const handleTrain = async () => {
    if (!bot || !user?.email) return;
    if (bot.status === "training") {
      toast("Training is already in progress.");
      return;
    }
    setActionLoading(true);
    setActionError("");
    try {
      await triggerBotTraining({
        botId: bot.id,
        websiteUrl: bot.website_url,
        userEmail: user.email,
        botName: bot.name,
        integrationTabUrl: buildIntegrationTabUrl(bot.id),
      });
      toast("Training started", {
        description: `We'll email ${user.email} when "${bot.name}" is ready.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start training";
      setActionError(msg);
      toast(msg);
    } finally {
      setActionLoading(false);
    }
  };


  const handleUpdate = async (
    updates: Partial<
      Pick<
        Bot,
        | "name"
        | "website_url"
        | "widget_header_color"
        | "widget_user_bubble_color"
        | "widget_bot_bubble_color"
        | "widget_display_name"
        | "widget_avatar_url"
      >
    >
  ) => {
    if (!bot) return;
    const updated = await botService.updateBot(bot.id, updates);
    setBot(updated);
  };

  const handleDelete = async () => {
    if (!bot) return;
    if (!confirm("Are you sure you want to delete this bot? This cannot be undone."))
      return;
    await botService.deleteBot(bot.id);
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !bot) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertDescription>{error ?? "Bot not found"}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{bot.name}</h1>
            <a
              href={bot.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              {bot.website_url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex gap-2">
            {bot.status === "pending" && (
              <Button className="cursor-pointer" onClick={handleTrain} disabled={actionLoading}>
                <Play className="mr-2 h-4 w-4" />
                Train Bot
              </Button>
            )}
            {/* TODO: Retrain button — enable once retrain workflow is implemented */}
          </div>
        </div>

        {actionError && (
          <Alert variant="destructive">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="widget">Widget</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Training Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrainingStatus bot={bot} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Bot Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bot ID</span>
                    <code className="rounded bg-muted px-2 py-0.5 text-xs">
                      {bot.id}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>
                      {new Date(bot.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span>
                      {new Date(bot.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pages Scraped</span>
                    <span>{bot.total_pages_scraped}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ChatTab botId={bot.id} />
          </TabsContent>

          <TabsContent value="widget" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <WidgetCustomization bot={bot} onUpdate={handleUpdate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="mt-6">
            <IntegrationCode botId={bot.id} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Bot Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <BotSettings
                  bot={bot}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
