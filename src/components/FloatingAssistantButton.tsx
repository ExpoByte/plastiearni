import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const FloatingAssistantButton = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <Button
      onClick={() => navigate("/assistant")}
      className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-elevated gradient-primary hover:scale-105 transition-transform"
      size="icon"
      title={language === "sw" ? "Msaada wa AI" : "AI Assistant"}
    >
      <Bot className="h-6 w-6" />
    </Button>
  );
};
