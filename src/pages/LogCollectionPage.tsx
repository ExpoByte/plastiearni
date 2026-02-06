import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { FloatingAssistantButton } from "@/components/FloatingAssistantButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Scale, MapPin, Package, Coins, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const POINTS_PER_KG = 100; // 100 points per kg of plastic

const plasticTypes = [
  { value: "pet", label: "PET Bottles", labelSw: "Chupa za PET" },
  { value: "hdpe", label: "HDPE Containers", labelSw: "Vyombo vya HDPE" },
  { value: "ldpe", label: "LDPE Bags/Films", labelSw: "Mifuko ya LDPE" },
  { value: "pp", label: "PP Caps/Containers", labelSw: "Vifuniko vya PP" },
  { value: "mixed", label: "Mixed Plastics", labelSw: "Plastiki Mchanganyiko" },
];

export const LogCollectionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const [weight, setWeight] = useState("");
  const [plasticType, setPlasticType] = useState("mixed");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const t = {
    title: language === "sw" ? "Rekodi Mkusanyiko" : "Log Collection",
    subtitle: language === "sw" ? "Rekodi plastiki yako uliyokusanya" : "Record your plastic collection",
    weight: language === "sw" ? "Uzito (kg)" : "Weight (kg)",
    weightPlaceholder: language === "sw" ? "Ingiza uzito" : "Enter weight",
    plasticType: language === "sw" ? "Aina ya Plastiki" : "Plastic Type",
    location: language === "sw" ? "Mahali pa Kukusanya" : "Collection Location",
    locationPlaceholder: language === "sw" ? "Wapi ulikokusanya" : "Where did you collect?",
    notes: language === "sw" ? "Maelezo (Si lazima)" : "Notes (Optional)",
    notesPlaceholder: language === "sw" ? "Maelezo yoyote ya ziada" : "Any additional details",
    pointsPreview: language === "sw" ? "Pointi Utakazopata" : "Points You'll Earn",
    submit: language === "sw" ? "Wasilisha Mkusanyiko" : "Submit Collection",
    successTitle: language === "sw" ? "Hongera!" : "Congratulations!",
    successMessage: language === "sw" ? "Umepata pointi" : "You've earned points",
    backToDashboard: language === "sw" ? "Rudi Nyumbani" : "Back to Dashboard",
    logAnother: language === "sw" ? "Rekodi Nyingine" : "Log Another",
  };

  const calculatedPoints = weight ? Math.round(parseFloat(weight) * POINTS_PER_KG) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit a collection");
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error(language === "sw" ? "Tafadhali ingiza uzito halali" : "Please enter a valid weight");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("collections").insert({
      user_id: user.id,
      weight_kg: weightNum,
      points_earned: calculatedPoints,
      plastic_type: plasticType,
      location: location || null,
      notes: notes || null,
      status: "verified", // Auto-verify for now
    });

    setLoading(false);

    if (error) {
      console.error("Error submitting collection:", error);
      toast.error(language === "sw" ? "Imeshindwa kuwasilisha" : "Failed to submit collection");
      return;
    }

    setEarnedPoints(calculatedPoints);
    setSuccess(true);
    toast.success(language === "sw" ? "Mkusanyiko umerekodiwa!" : "Collection recorded!");
  };

  const handleLogAnother = () => {
    setSuccess(false);
    setWeight("");
    setPlasticType("mixed");
    setLocation("");
    setNotes("");
    setEarnedPoints(0);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="flex flex-col items-center justify-center px-6 pt-20">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-6">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t.successTitle}</h1>
          <p className="text-muted-foreground mt-2">{t.successMessage}</p>
          <div className="mt-6 flex items-center gap-2 rounded-2xl bg-primary/10 px-8 py-4">
            <Coins className="h-8 w-8 text-primary" />
            <span className="text-4xl font-bold text-primary">+{earnedPoints}</span>
          </div>
          <div className="mt-8 flex gap-4 w-full max-w-xs">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
              {t.backToDashboard}
            </Button>
            <Button className="flex-1 gradient-primary" onClick={handleLogAnother}>
              {t.logAnother}
            </Button>
          </div>
        </div>
        <FloatingAssistantButton />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pb-8 pt-8 text-primary-foreground">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 opacity-80 hover:opacity-100">
          <ArrowLeft className="h-5 w-5" />
          <span>{language === "sw" ? "Rudi" : "Back"}</span>
        </button>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm opacity-80">{t.subtitle}</p>
      </header>

      <main className="px-4 -mt-4">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl bg-card p-6 shadow-card">
          {/* Weight Input */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              {t.weight}
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0.1"
              placeholder={t.weightPlaceholder}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              className="text-lg"
            />
          </div>

          {/* Plastic Type Select */}
          <div className="space-y-2">
            <Label htmlFor="plasticType" className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              {t.plasticType}
            </Label>
            <Select value={plasticType} onValueChange={setPlasticType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {plasticTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {language === "sw" ? type.labelSw : type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {t.location}
            </Label>
            <Input
              id="location"
              placeholder={t.locationPlaceholder}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Notes Textarea */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t.notes}</Label>
            <Textarea
              id="notes"
              placeholder={t.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Points Preview */}
          <div className="rounded-2xl bg-primary/10 p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.pointsPreview}</p>
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-primary" />
              <span className="text-3xl font-bold text-primary">{calculatedPoints}</span>
              <span className="text-sm text-muted-foreground">({POINTS_PER_KG} pts/kg)</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full gradient-primary text-lg py-6"
            disabled={loading || !weight}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {language === "sw" ? "Inawasilisha..." : "Submitting..."}
              </>
            ) : (
              t.submit
            )}
          </Button>
        </form>
      </main>

      <FloatingAssistantButton />
      <BottomNav />
    </div>
  );
};

export default LogCollectionPage;
