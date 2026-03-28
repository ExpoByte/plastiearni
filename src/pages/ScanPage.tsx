import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, Loader2, CheckCircle, XCircle, Coins, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { FloatingAssistantButton } from "@/components/FloatingAssistantButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const processingRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startScanning = async () => {
    setState("scanning");
    processingRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Dynamically import the QR scanner library for decoding frames
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();

      // Poll frames from the video for QR codes
      scanIntervalRef.current = window.setInterval(async () => {
        if (processingRef.current || !videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          // Use luminance source approach
          const result = await reader.decodeFromCanvas(canvas);
          if (result) {
            processingRef.current = true;
            stopCamera();
            await handleScan(result.getText());
          }
        } catch {
          // No QR found in this frame — ignore
        }
      }, 300);
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Could not access camera. Please grant camera permission and try again.");
      setState("idle");
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleScan = async (decodedText: string) => {
    setState("processing");

    try {
      let transactionCode: string;
      try {
        const parsed = JSON.parse(decodedText);
        transactionCode = parsed.code;
      } catch {
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
        {/* Hidden canvas for frame processing */}
        <canvas ref={canvasRef} className="hidden" />

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

        {state === "scanning" && (
          <div className="rounded-3xl bg-card p-4 shadow-card space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
              />
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 border-2 border-primary rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                  {/* Animated scan line */}
                  <div className="absolute left-2 right-2 h-0.5 bg-primary animate-pulse top-1/2" />
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Position the QR code within the frame
            </p>
            <Button
              variant="outline"
              onClick={() => {
                stopCamera();
                setState("idle");
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        {state === "processing" && (
          <div className="rounded-3xl bg-card p-8 shadow-card flex flex-col items-center text-center space-y-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <h2 className="text-xl font-bold text-foreground">Processing...</h2>
            <p className="text-sm text-muted-foreground">Verifying QR code and crediting your points</p>
          </div>
        )}

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
