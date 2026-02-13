import { useState } from "react";
import { DashboardLayout } from "@/components/Common/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SUBSCRIPTION_TIERS } from "@/utils/constants";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const tier = profile?.subscription_tier ?? "free";
  const tierInfo = SUBSCRIPTION_TIERS[tier];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      await updateProfile({ full_name: fullName.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>Profile updated.</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email ?? ""} disabled />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Your current plan and usage limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                {tierInfo.label}
              </Badge>
              {tier === "free" && (
                <span className="text-sm text-muted-foreground">
                  Upgrade for more bots and conversations
                </span>
              )}
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Bots</span>
                <span>
                  {profile?.max_bots === -1
                    ? "Unlimited"
                    : profile?.max_bots ?? 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Conversations / month
                </span>
                <span>
                  {tierInfo.conversationsPerMonth === -1
                    ? "Unlimited"
                    : tierInfo.conversationsPerMonth}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div>
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
