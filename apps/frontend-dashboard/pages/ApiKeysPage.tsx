import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ApiKeyDTO } from "@repo/shared";
import {
  useApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
  useUpdateApiKey,
} from "hooks/useApiKeys";
import {
  Badge,
  CheckCheck,
  Copy,
  Key,
  Loader2,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ApiKeyProps {
  apiKey: ApiKeyDTO;
}
const KeyRow = ({ apiKey }: ApiKeyProps) => {
  const updateKey = useUpdateApiKey();
  const deleteKey = useDeleteApiKey();
  const [copied, setCopied] = useState(false);

  const copyKey = async () => {
    await navigator.clipboard.writeText(apiKey?.key);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const toggleDisabled = async () => {
    await updateKey.mutateAsync({
      id: apiKey?.id,
      updates: {
        disabled: !apiKey?.disabled,
      },
    });
    toast.success(
      `Key ${apiKey?.name} ${apiKey?.disabled ? "enabled" : "disabled"}`,
    );
  };

  const handleDelete = async () => {
    await deleteKey.mutateAsync(apiKey?.id);
    toast.success(`Key ${apiKey?.name} deleted`);
  };

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-secondary/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="font-semibold text-sm truncate">{apiKey?.name}</span>
          <Badge fontVariant={apiKey?.disabled ? "warning" : "success"}>
            {apiKey?.disabled ? "Disabled" : "Enabled"}
          </Badge>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="rounded bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground border border-border">
            {apiKey?.key.slice(0, 10)}••••••••••{apiKey?.key.slice(-4)}
          </code>
          <span>
            Created {new Date(apiKey?.createdAt).toLocaleDateString()}
            {apiKey?.lastUsedAt &&
              `. Last used ${new Date(apiKey?.lastUsedAt).toLocaleDateString()}`}
          </span>
        </div>
      </div>

      <TooltipProvider delayDuration={0}>
        <div className="flex items-center gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={copyKey}>
                {copied ? (
                  <CheckCheck className="size-4 text-emerald-400" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy key</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDisabled}
                disabled={updateKey.isPending}
              >
                {apiKey?.disabled ? (
                  <Power className="size-4 text-emerald-400" />
                ) : (
                  <PowerOff className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {apiKey?.disabled ? "Enable" : "Disable"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteKey?.isPending}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete key</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
};
const ApiKeysPage = () => {
  const createKey = useCreateApiKey();
  const { data: keys = [], isLoading } = useApiKeys();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keyName, setKeyName] = useState("");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!keyName.trim()) return;

    try {
      await createKey.mutateAsync({
        name: keyName.trim(),
      });
  
      toast.success(`Created key ${keyName.trim()}`);
      setKeyName("");
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p>Manage keys for authenticating AI requests</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 size-4" />
          New Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Your Keys</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          {isLoading ? (
            <div className="space-y-3 p-5">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
                <Key className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">No API keys yet</p>
                <p className="text-sm text-muted-foreground">
                  Create one to start making requests.
                </p>
              </div>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-1 size-4" />
                Create Key
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {keys?.map((key) => (
                <KeyRow key={key?.id} apiKey={key} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Give your kep a descriptive name so you can identify it
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate}>
            <div className="py-4 space-y-2">
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g. Production, Development"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant={"outline"}
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createKey.isPending || !keyName.trim()}
              >
                {createKey.isPending && (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                )}
                Create Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeysPage;
