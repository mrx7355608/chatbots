import { useState } from "react";
import { DashboardLayout } from "@/components/Common/DashboardLayout";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { BotTable } from "@/components/Dashboard/BotTable";
import { CreateBotModal } from "@/components/Dashboard/CreateBotModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBots } from "@/hooks/useBots";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { bots, loading, error, createBot, deleteBot } = useBots();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleDelete = async (botId: string) => {
    if (!confirm("Are you sure you want to delete this bot?")) return;
    try {
      await deleteBot(botId);
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your AI chatbots
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Bot
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <StatsCards bots={bots} />
            <BotTable bots={bots} onDelete={handleDelete} />
          </>
        )}

        <CreateBotModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSubmit={async (input) => {
            await createBot(input);
          }}
        />
      </div>
    </DashboardLayout>
  );
}
