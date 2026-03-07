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
import type { ApiKeyDTO } from "@repo/shared";
import {
  useApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
  useUpdateApiKey,
} from "hooks/useApiKeys";
import { Badge, Key, Loader2, Plus } from "lucide-react";
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
    await navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const toggleDisabled = async () => {
    await updateKey.mutateAsync({
      id: apiKey.id,
      updates: {
        disabled: !apiKey.disabled,
      },
    });
    toast.success(
      `Key ${apiKey.name} ${apiKey.disabled ? "enabled" : "disabled"}`,
    );
  };

  return (
    <div>
      <div>
        <div>
          <span>{apiKey.name}</span>
          <Badge fontVariant={apiKey.disabled ? "warning" : "success"}>
            {apiKey.disabled ? "Disabled" : "Enabled"}
          </Badge>
        </div>
      </div>
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

    await createKey.mutateAsync({
      name: keyName.trim(),
    });

    toast.success(`Created key ${keyName.trim()}`);
    setKeyName("");
    setDialogOpen(false);
  };
  return (
    <div>
      <div>
        <div>
          <h1>API Keys</h1>
          <p>Manage keys for authenticating AI requests</p>
        </div>
        <Button>
          <Plus className="mr-1 size-4" />
          New Key
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Keys</CardTitle>
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
              {keys.map((key) => (
                <KeyRow key={key.id} apiKey={key} />
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
