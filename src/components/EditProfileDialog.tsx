import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Phone, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !open) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, phone_number")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        setDisplayName(data.display_name || "");
        setPhoneNumber(data.phone_number || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        phone_number: phoneNumber.trim(),
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } else {
      toast.success(t.profileUpdated);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {t.editProfile}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Avatar placeholder */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground">
                  {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                </div>
                <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-card text-primary">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">{t.displayName}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t.phoneNumber}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                {t.cancel}
              </Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t.saveChanges}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
