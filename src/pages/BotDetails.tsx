import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/Common/DashboardLayout";
import { TrainingStatus } from "@/components/Bot/TrainingStatus";
import { IntegrationCode } from "@/components/Bot/IntegrationCode";
import { BotSettings } from "@/components/Bot/BotSettings";
import { useBot } from "@/hooks/useBots";
import type { Bot } from "@/types";
import * as botService from "@/services/botService";
import { triggerBotTraining, triggerBotRetrain } from "@/services/n8nService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

export default function BotDetails() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { bot, loading, error, refetch } = useBot(botId!);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleTrain = async () => {
    if (!bot) return;
    setActionLoading(true);
    setActionError("");
    try {
      await triggerBotTraining(bot.id, bot.website_url);
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to start training"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetrain = async () => {
    if (!bot) return;
    setActionLoading(true);
    setActionError("");
    try {
      await triggerBotRetrain(bot.id, bot.website_url);
      refetch();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to start retraining"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (
    updates: Partial<Pick<Bot, "name" | "website_url">>
  ) => {
    if (!bot) return;
    await botService.updateBot(bot.id, updates);
    refetch();
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
              <Button onClick={handleTrain} disabled={actionLoading}>
                <Play className="mr-2 h-4 w-4" />
                Train Bot
              </Button>
            )}
            {bot.status === "ready" && (
              <Button
                variant="outline"
                onClick={handleRetrain}
                disabled={actionLoading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retrain
              </Button>
            )}
          </div>
        </div>

        {actionError && (
          <Alert variant="destructive">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
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

          <TabsContent value="integration" className="mt-6">
            {bot.integration_code ? (
              <IntegrationCode code={bot.integration_code} botId={bot.id} />
            ) : (
              <Alert>
                <AlertDescription>
                  Integration code will be available after the bot is created.
                </AlertDescription>
              </Alert>
            )}
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
