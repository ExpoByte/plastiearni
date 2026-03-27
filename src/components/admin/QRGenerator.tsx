import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Scale, Coins, QrCode, Loader2, CheckCircle, Copy, Download, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const POINTS_PER_KG = 100;
const EXPIRY_OPTIONS = [
  { value: "5", label: "5 minutes" },
  { value: "10", label: "10 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
];

const plasticTypes = [
  { value: "pet", label: "PET Bottles" },
  { value: "hdpe", label: "HDPE Containers" },
  { value: "ldpe", label: "LDPE Bags/Films" },
  { value: "pp", label: "PP Caps/Containers" },
  { value: "mixed", label: "Mixed Plastics" },
];

interface GeneratedQR {
  transactionCode: string;
  weight: number;
  points: number;
  expiresAt: string;
}

export const QRGenerator = () => {
  const { user } = useAuth();
  const [weight, setWeight] = useState("");
  const [plasticType, setPlasticType] = useState("mixed");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState("10");
  const [loading, setLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<GeneratedQR | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [recentQRs, setRecentQRs] = useState<GeneratedQR[]>([]);

  const calculatedPoints = weight ? Math.round(parseFloat(weight) * POINTS_PER_KG) : 0;

  const handleGenerate = async () => {
    if (!user) return;
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error("Please enter a valid weight");
      return;
    }

    setLoading(true);
    const expiresAt = new Date(Date.now() + parseInt(expiryMinutes) * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("qr_transactions")
      .insert({
        weight_kg: weightNum,
        points: calculatedPoints,
        plastic_type: plasticType,
        location: location || null,
        notes: notes || null,
        created_by: user.id,
        expires_at: expiresAt,
      } as any)
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Error generating QR:", error);
      toast.error("Failed to generate QR code");
      return;
    }

    const qr: GeneratedQR = {
      transactionCode: (data as any).transaction_code,
      weight: weightNum,
      points: calculatedPoints,
      expiresAt,
    };
    setGeneratedQR(qr);
    setRecentQRs((prev) => [qr, ...prev].slice(0, 10));
    setShowQRDialog(true);
    toast.success("QR code generated successfully!");

    // Reset form
    setWeight("");
    setLocation("");
    setNotes("");
  };

  const qrPayload = generatedQR
    ? JSON.stringify({
        code: generatedQR.transactionCode,
        w: generatedQR.weight,
        p: generatedQR.points,
        t: Date.now(),
      })
    : "";

  const copyCode = () => {
    if (generatedQR) {
      navigator.clipboard.writeText(generatedQR.transactionCode);
      toast.success("Transaction code copied!");
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const a = document.createElement("a");
      a.download = `qr-${generatedQR?.transactionCode.slice(0, 8)}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <QrCode className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Generate QR Code</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              Weight (kg)
            </Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Enter weight in kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Plastic Type</Label>
            <Select value={plasticType} onValueChange={setPlasticType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {plasticTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              QR Expiry Time
            </Label>
            <Select value={expiryMinutes} onValueChange={setExpiryMinutes}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPIRY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location (optional)</Label>
            <Input
              placeholder="Collection location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Textarea
            placeholder="Additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        {/* Points Preview */}
        <div className="rounded-2xl bg-primary/10 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Points to award</p>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-primary">{calculatedPoints}</span>
              <span className="text-sm text-muted-foreground">({POINTS_PER_KG} pts/kg)</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            Expires in {expiryMinutes}min
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading || !weight}
          className="w-full gradient-primary text-lg py-5"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
          ) : (
            <><QrCode className="mr-2 h-5 w-5" /> Generate QR Code</>
          )}
        </Button>
      </Card>

      {/* Recent QR Codes */}
      {recentQRs.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent QR Codes</h3>
          <div className="space-y-3">
            {recentQRs.map((qr, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div>
                  <p className="font-mono text-sm">{qr.transactionCode.slice(0, 16)}...</p>
                  <p className="text-xs text-muted-foreground">
                    {qr.weight} kg · {qr.points} pts
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setGeneratedQR(qr);
                    setShowQRDialog(true);
                  }}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              QR Code Ready
            </DialogTitle>
          </DialogHeader>

          {generatedQR && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrPayload}
                  size={240}
                  level="H"
                  includeMargin
                />
              </div>

              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-primary">{generatedQR.points} pts</p>
                <p className="text-sm text-muted-foreground">{generatedQR.weight} kg plastic</p>
                <p className="text-xs text-muted-foreground">
                  Expires: {new Date(generatedQR.expiresAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={copyCode}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Code
                </Button>
                <Button className="flex-1" onClick={downloadQR}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Show this QR code to the user to scan and earn points.
                <br />One-time use only. Cannot be reused after scanning.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
