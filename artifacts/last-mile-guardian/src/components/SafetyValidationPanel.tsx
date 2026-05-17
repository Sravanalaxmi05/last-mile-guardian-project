import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SafetyValidationPanel({ safety }: { safety: any }) {
  if (!safety) return null;

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">
          Safety Validation: {safety.passed ? "Passed" : "Failed"}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        {safety.errors?.length > 0 && (
          <div>
            <div className="font-semibold">Errors</div>
            <ul className="list-disc pl-5">
              {safety.errors.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {safety.warnings?.length > 0 && (
          <div>
            <div className="font-semibold">Warnings</div>
            <ul className="list-disc pl-5">
              {safety.warnings.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
