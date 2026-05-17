import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LiveRunProof({ data }: { data: any }) {
  const metadata = data.metadata;

  return (
    <Card className="border-primary/20">
      <CardHeader className="py-3">
        <CardTitle className="text-base">Live Run Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs font-mono">
        <div>
          Mode:{" "}
          <Badge variant="outline">
            {data.mode === "gemma4" ? "Live Gemma 4" : "Demo fallback"}
          </Badge>
        </div>
        <div>Model: {metadata?.model || "not available"}</div>
        <div>Provider: {metadata?.provider || "not available"}</div>
        <div>Fallback used: {String(metadata?.fallbackUsed)}</div>
        {metadata?.fallbackReason && <div>Fallback reason: {metadata.fallbackReason}</div>}
        <div>Generated at: {metadata?.generatedAt}</div>
        <div>Latency: {metadata?.latencyMs} ms</div>
        <div>Output hash: {metadata?.outputHash}</div>
      </CardContent>
    </Card>
  );
}
