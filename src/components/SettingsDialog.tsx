import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, Globe, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            {t.settings}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Language Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base font-medium">{t.language}</Label>
            </div>
            
            <RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value as "en" | "sw")}
              className="space-y-2"
            >
              <div
                className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors ${
                  language === "en" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setLanguage("en")}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <p className="font-medium text-foreground">English</p>
                    <p className="text-sm text-muted-foreground">Default language</p>
                  </div>
                </div>
                <RadioGroupItem value="en" id="en" />
              </div>

              <div
                className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors ${
                  language === "sw" ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => setLanguage("sw")}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇰🇪</span>
                  <div>
                    <p className="font-medium text-foreground">Kiswahili</p>
                    <p className="text-sm text-muted-foreground">Lugha ya Kiswahili</p>
                  </div>
                </div>
                <RadioGroupItem value="sw" id="sw" />
              </div>
            </RadioGroup>
          </div>

          <Button className="w-full" onClick={() => onOpenChange(false)}>
            <Check className="h-4 w-4 mr-2" />
            {t.done}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
