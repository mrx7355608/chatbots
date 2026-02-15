import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/Common/DashboardLayout";
import { IntegrationCode } from "@/components/Bot/IntegrationCode";
import { useBot } from "@/hooks/useBots";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, ShoppingBag, Puzzle } from "lucide-react";

export default function Integration() {
  const { botId } = useParams<{ botId: string }>();
  const { bot, loading, error } = useBot(botId!);

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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/bot/${bot.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Integrate {bot.name}
            </h1>
            <p className="text-muted-foreground">
              Choose how to add your chatbot to your website
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">JavaScript Widget</CardTitle>
              </div>
              <CardDescription>
                Add a floating chat widget to any website with a simple script
                tag.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge className="mb-3">Recommended</Badge>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <CardTitle className="text-base">Shopify App</CardTitle>
              </div>
              <CardDescription>
                One-click installation for Shopify stores with automatic product
                integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Puzzle className="h-5 w-5" />
                <CardTitle className="text-base">WordPress Plugin</CardTitle>
              </div>
              <CardDescription>
                Easy WordPress integration with admin panel and shortcode
                support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardContent>
          </Card>
        </div>

        <IntegrationCode botId={bot.id} />
      </div>
    </DashboardLayout>
  );
}
