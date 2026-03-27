import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, Loader2, CheckCircle, XCircle, Coins, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { FloatingAssistantButton } from "@/components/FloatingAssistantButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Html5Qrcode } from "html5-qrcode";

type ScanState = "idle" | "scanning" | "processing" | "success" | "error";

interface ScanResult {
  points?: number;
  weight_kg?: number;
  errorMessage?: string;
}

export const ScanPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult>({});
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const startScanning = async () => {
    setState("scanning");
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (processingRef.current) return;
          processingRef.current = true;
          await handleScan(decodedText);
        },
        () => {} // Ignore scan failures (no QR found in frame)
      );
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Could not access camera. Please grant camera permission.");
      setState("idle");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const handleScan = async (decodedText: string) => {
    await stopScanning();
    setState("processing");

    try {
      // Parse QR data
      let transactionCode: string;
      try {
        const parsed = JSON.parse(decodedText);
        transactionCode = parsed.code;
      } catch {
        // Maybe it's just the raw code
        transactionCode = decodedText;
      }

      if (!transactionCode) {
        setResult({ errorMessage: "Invalid QR code format" });
        setState("error");
        return;
      }

      const { data, error } = await supabase.functions.invoke("qr-redeem", {
        body: { transactionCode },
      });

      if (error) {
        setResult({ errorMessage: error.message || "Redemption failed" });
        setState("error");
        return;
      }

      if (data?.success) {
        setResult({ points: data.points, weight_kg: data.weight_kg });
        setState("success");
      } else {
        setResult({ errorMessage: data?.error || "Unknown error" });
        setState("error");
      }
    } catch (err) {
      console.error("Scan error:", err);
      setResult({ errorMessage: "Network error. Please try again." });
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult({});
    processingRef.current = false;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pb-8 pt-8 text-primary-foreground">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 opacity-80 hover:opacity-100"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t.back}</span>
        </button>
        <div className="flex items-center gap-3">
          <QrCode className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Scan QR Code</h1>
            <p className="text-sm opacity-80">Scan to earn points instantly</p>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-4">
        {/* Idle State */}
        {state === "idle" && (
          <div className="rounded-3xl bg-card p-8 shadow-card flex flex-col items-center text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Ready to Scan</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Point your camera at a PlastiEarn QR code to instantly earn points for your plastic collection.
              </p>
            </div>
            <Button onClick={startScanning} className="w-full gradient-primary text-lg py-6">
              <Camera className="mr-2 h-5 w-5" />
              Open Scanner
            </Button>
          </div>
        )}

        {/* Scanning State */}
        {state === "scanning" && (
          <div className="rounded-3xl bg-card p-4 shadow-card space-y-4">
            <div id="qr-reader" className="rounded-2xl overflow-hidden" />
            <p className="text-center text-sm text-muted-foreground">
              Position the QR code within the frame
            </p>
            <Button
              variant="outline"
              onClick={() => {
                stopScanning();
                setState("idle");
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Processing State */}
        {state === "processing" && (
          <div className="rounded-3xl bg-card p-8 shadow-card flex flex-col items-center text-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-xl font-bold text-foreground">Processing...</h2>
            <p className="text-sm text-muted-foreground">Verifying QR code and crediting your points</p>
          </div>
        )}

        {/* Success State */}
        {state === "success" && (
          <div className="rounded-3xl bg-card p-8 shadow-card flex flex-col items-center text-center space-y-6 animate-fade-in">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Points Earned!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {result.weight_kg} kg of plastic recorded
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-primary/10 px-8 py-5">
              <Coins className="h-10 w-10 text-primary" />
              <span className="text-5xl font-bold text-primary">+{result.points}</span>
            </div>
            <div className="flex gap-4 w-full">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                Dashboard
              </Button>
              <Button className="flex-1 gradient-primary" onClick={handleReset}>
                Scan Another
              </Button>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === "error" && (
          <div className="rounded-3xl bg-card p-8 shadow-card flex flex-col items-center text-center space-y-6 animate-fade-in">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Scan Failed</h2>
              <p className="text-sm text-destructive mt-2">{result.errorMessage}</p>
            </div>
            <div className="flex gap-4 w-full">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
                Dashboard
              </Button>
              <Button className="flex-1" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </main>

      <FloatingAssistantButton />
      <BottomNav />
    </div>
  );
};

export default ScanPage;
