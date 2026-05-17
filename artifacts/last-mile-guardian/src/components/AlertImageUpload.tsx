import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result);
      const [, base64] = result.split(",");

      if (!base64) {
        reject(new Error("Could not read image data."));
        return;
      }

      resolve({ base64, mimeType: file.type || "image/png" });
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AlertImageUpload({
  onImageReady,
}: {
  onImageReady: (image: { base64: string; mimeType: string }) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="alert-image">Optional official alert image</Label>
      <Input
        id="alert-image"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onImageReady(await fileToBase64(file));
        }}
      />
      <p className="text-xs text-muted-foreground">
        Use this for a screenshot/photo of an official flood alert. Gemma 4 extracts the alert text before generating cards.
      </p>
    </div>
  );
}
