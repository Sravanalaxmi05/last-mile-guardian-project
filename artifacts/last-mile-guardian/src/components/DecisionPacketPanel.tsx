import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DecisionPacketPanel({ packet }: { packet?: any }) {
  if (!packet) return null;

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Validated Vulnerability Decision Packet</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs overflow-auto rounded bg-zinc-950 text-zinc-50 p-4">
          {JSON.stringify(packet, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
