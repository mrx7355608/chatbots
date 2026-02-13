import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Bot } from "@/types";
import {
  BOT_STATUS_LABELS,
  BOT_STATUS_COLORS,
} from "@/utils/constants";
import {
  ExternalLink,
  MoreHorizontal,
  Eye,
  Code,
  Trash2,
} from "lucide-react";

interface BotTableProps {
  bots: Bot[];
  onDelete: (botId: string) => void;
}

export function BotTable({ bots, onDelete }: BotTableProps) {
  if (bots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-lg font-medium text-muted-foreground">
          No bots yet
        </p>
        <p className="text-sm text-muted-foreground">
          Create your first chatbot to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pages Scraped</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {bots.map((bot) => (
            <TableRow key={bot.id}>
              <TableCell>
                <Link
                  to={`/bot/${bot.id}`}
                  className="font-medium hover:underline"
                >
                  {bot.name}
                </Link>
              </TableCell>
              <TableCell>
                <a
                  href={bot.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  {new URL(bot.website_url).hostname}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={BOT_STATUS_COLORS[bot.status]}
                >
                  {BOT_STATUS_LABELS[bot.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {bot.total_pages_scraped}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(bot.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/bot/${bot.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/bot/${bot.id}/integrate`}>
                        <Code className="mr-2 h-4 w-4" />
                        Integration
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(bot.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
