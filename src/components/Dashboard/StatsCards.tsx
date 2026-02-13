import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Bot } from "@/types";
import { Bot as BotIcon, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface StatsCardsProps {
  bots: Bot[];
}

export function StatsCards({ bots }: StatsCardsProps) {
  const totalBots = bots.length;
  const readyBots = bots.filter((b) => b.status === "ready").length;
  const trainingBots = bots.filter((b) => b.status === "training").length;
  const errorBots = bots.filter((b) => b.status === "error").length;

  const stats = [
    {
      label: "Total Bots",
      value: totalBots,
      icon: BotIcon,
      color: "text-foreground",
    },
    {
      label: "Active",
      value: readyBots,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Training",
      value: trainingBots,
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Errors",
      value: errorBots,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
