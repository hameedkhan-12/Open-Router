import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SelectContent, Separator } from "@radix-ui/react-select";
import { useApiKeys } from "hooks/useApiKeys";
import { useProxyRequests } from "hooks/useProxyRequests";
import { Loader2, Send, Terminal } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const MODELS = [
  "gemini-3-flash-preview",
  "openai/gpt-4o-mini",
  "openai/gpt-4o",
  "anthropic/claude-3-haiku",
  "anthropic/claude-3-5-sonnet",
  "meta-llama/llama-3.1-70b-instruct",
  "google/gemini-flash-3.5",
];

const PlaygroundPage = () => {
  const { data: keys = [] } = useApiKeys();
  const activeKeys = keys.filter((key) => !key.disabled && !key.deleted);

  const [selectedKeyId, setSelectedKeyId] = useState("");
  const [model, setModel] = useState(MODELS[0]!);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    prompt: number;
    completion: number;
  } | null>(null);

  const selectedKey = activeKeys?.find(
    (key) => String(key.id) === selectedKeyId,
  );

  const { mutateAsync: sendRequest, isPending } = useProxyRequests(
    selectedKey?.key ?? "",
  );

  const handleSend = async () => {
    if (!prompt.trim()) return;
    if (!selectedKey) {
      toast.error("Please select an API Key");
    }
    setResponse(null);
    setUsage(null);

    try {
      const result = await sendRequest({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1024,
      });
      setResponse(result?.choices[0]?.message?.content ?? "(no response)");

      setUsage({
        prompt: result.usage?.prompt_tokens ?? 0,
        completion: result.usage?.completion_tokens ?? 0,
      });
    } catch (error: any) {
      const msge = error?.response?.data?.error ?? error.message;
      setResponse(`Error: ${msge}`);
      toast.error(msge);
    }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
        <p>Test your API Keys against AI Models in real time</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>API Key</Label>
          <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
            <SelectTrigger>
              <SelectValue placeholder="Select an API Key" />
            </SelectTrigger>
            <SelectContent>
              {activeKeys.length === 0 ? (
                <SelectItem value="_none" disabled>
                  No Active API Keys
                </SelectItem>
              ) : (
                activeKeys.map((key) => (
                  <SelectItem key={key.id} value={String(key.id)}>
                    {key.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Prompt</Label>
        <Textarea
          rows={6}
          placeholder="Enter your prompt here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
          }}
          className="resize-none font-sans text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span>⌘ + Enter to send</span>
          <Button
            onClick={handleSend}
            disabled={isPending || !prompt.trim() || !selectedKey}
          >
            {isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
          </Button>
        </div>
      </div>

      {(response !== null || !isPending) && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <Terminal className="size-4" />
                Response
              </CardTitle>
              {usage && (
                <div className="flex items-center gap-2">
                  <Badge variant={"outline"} className="font-mono text-xs">
                    {usage.prompt}↑ tokens
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {usage.completion}↓ tokens
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            {isPending ? (
              <div className="flex gap-1.5 py-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-2 rounded-full bg-primary animate-bounce"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {response}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlaygroundPage;
