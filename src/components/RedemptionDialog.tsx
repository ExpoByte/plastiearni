import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RedemptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: {
    title: string;
    category: string;
    points: number;
    amount: number;
  } | null;
  onSuccess?: () => void;
}

type RedemptionState = "input" | "processing" | "success" | "error";

export const RedemptionDialog = ({
  open,
  onOpenChange,
  reward,
  onSuccess,
}: RedemptionDialogProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState<RedemptionState>("input");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async () => {
    if (!reward) return;

    // Validate phone number (Kenyan format)
    const phoneRegex = /^(?:\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      toast.error("Please enter a valid Kenyan phone number");
      return;
    }

    setState("processing");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to redeem rewards");
        setState("input");
        return;
      }

      const response = await supabase.functions.invoke("mpesa-redeem", {
        body: {
          phoneNumber: phoneNumber.replace(/\s/g, ""),
          amount: reward.amount,
          rewardTitle: reward.title,
          rewardCategory: reward.category,
          pointsSpent: reward.points,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Redemption failed");
      }

      const data = response.data;

      if (data.success) {
        setState("success");
        onSuccess?.();
      } else {
        setErrorMessage(data.error || "Redemption failed");
        setState("error");
      }
    } catch (error) {
      console.error("Redemption error:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
      setState("error");
    }
  };

  const handleClose = () => {
    setPhoneNumber("");
    setState("input");
    setErrorMessage("");
    onOpenChange(false);
  };

  if (!reward) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            {state === "success" ? "Success!" : state === "error" ? "Error" : "Redeem Reward"}
          </DialogTitle>
          <DialogDescription>
            {state === "input" && `Redeem ${reward.title} for ${reward.points} points`}
            {state === "processing" && "Processing your redemption..."}
            {state === "success" && "Your reward is on its way!"}
            {state === "error" && "Something went wrong"}
          </DialogDescription>
        </DialogHeader>

        {state === "input" && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">M-Pesa Phone Number</Label>
              <Input
                id="phone"
                placeholder="e.g., 0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Enter the phone number to receive KES {reward.amount}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Points to spend</span>
                <span className="font-semibold text-primary">{reward.points} pts</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Amount to receive</span>
                <span className="font-semibold">KES {reward.amount}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Confirm
              </Button>
            </div>
          </div>
        )}

        {state === "processing" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Connecting to M-Pesa...
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="h-12 w-12 text-primary" />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              KES {reward.amount} will be sent to your M-Pesa shortly.
              <br />
              Check your phone for confirmation.
            </p>
            <Button className="mt-6" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center py-8">
            <XCircle className="h-12 w-12 text-destructive" />
            <p className="mt-4 text-center text-sm text-destructive">
              {errorMessage}
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setState("input")}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
