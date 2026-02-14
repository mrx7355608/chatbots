import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Bot } from "@/types";
import { BOT_STATUS_LABELS, BOT_STATUS_COLORS } from "@/utils/constants";
import { CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";

interface TrainingStatusProps {
  bot: Bot;
}

const statusProgress: Record<string, number> = {
  pending: 0,
  training: 50,
  ready: 100,
  error: 0,
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  training: <Loader2 className="h-4 w-4 animate-spin" />,
  ready: <CheckCircle className="h-4 w-4 text-green-400" />,
  error: <AlertCircle className="h-4 w-4 text-red-400" />,
};

export function TrainingStatus({ bot }: TrainingStatusProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {statusIcons[bot.status]}
        <div>
          <Badge
            variant="secondary"
            className={BOT_STATUS_COLORS[bot.status]}
          >
            {BOT_STATUS_LABELS[bot.status]}
          </Badge>
        </div>
      </div>

      {bot.status === "training" && (
        <div className="space-y-2">
          <Progress value={statusProgress[bot.status]} />
          <p className="text-sm text-muted-foreground">
            Training in progress... This may take a few minutes.
          </p>
        </div>
      )}

      {bot.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Training failed. Please try retraining or contact support.
          </AlertDescription>
        </Alert>
      )}

      {bot.status === "ready" && (
        <div className="text-sm text-muted-foreground">
          <p>Pages scraped: {bot.total_pages_scraped}</p>
          {bot.last_trained_at && (
            <p>
              Last trained:{" "}
              {new Date(bot.last_trained_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
