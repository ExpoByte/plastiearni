import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Recycle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setIsRecovery(true);
        }
      }
    );

    // Check URL hash for recovery type
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error(t.passwordMinLength);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success(t.passwordResetSuccess);
      setTimeout(() => navigate("/"), 2000);
    }
  };

  if (!isRecovery && !success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Recycle className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">{t.invalidResetLink}</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">{t.invalidResetLinkDesc}</p>
        <Button onClick={() => navigate("/auth")}>{t.backToSignIn}</Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <CheckCircle className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">{t.passwordResetSuccess}</h1>
        <p className="text-sm text-muted-foreground">{t.redirectingToDashboard}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="gradient-hero px-6 pb-12 pt-12 text-primary-foreground text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Recycle className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">TakaPoints</h1>
        <p className="text-sm opacity-80 mt-2">{t.setNewPassword}</p>
      </header>

      <div className="flex-1 -mt-6 rounded-t-3xl bg-card px-6 py-8">
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">{t.newPassword}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.resetPassword}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
