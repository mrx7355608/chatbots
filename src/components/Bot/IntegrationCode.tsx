import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Copy, Info } from "lucide-react";

const WIDGET_URL =
  import.meta.env.VITE_CHAT_WIDGET_URL ?? "https://yourdomain.com/widget.js";

interface IntegrationCodeProps {
  botId: string;
}

function generateSnippet(botId: string): string {
  return `<script src="${WIDGET_URL}"></script>
<script>
  ChatBot.init({ botId: '${botId}' });
</script>`;
}

export function IntegrationCode({ botId }: IntegrationCodeProps) {
  const [copied, setCopied] = useState(false);
  const code = generateSnippet(botId);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Add this code snippet just before the closing{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            &lt;/body&gt;
          </code>{" "}
          tag on your website.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Integration Code
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-2 h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-3 w-3" />
                Copy
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
            <code>{code}</code>
          </pre>
        </CardContent>
      </Card>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong>Bot ID:</strong>{" "}
          <code className="rounded bg-muted px-1 py-0.5">{botId}</code>
        </p>
        <p>
          The widget will appear as a floating chat button on the bottom-right
          of your website.
        </p>
      </div>
    </div>
  );
}
