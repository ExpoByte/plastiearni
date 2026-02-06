import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Coins, MapPin, Gift, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const slides = [
    {
      icon: Recycle,
      title: t.collectPlastic,
      description: t.collectPlasticDesc,
      color: "from-primary to-secondary",
    },
    {
      icon: MapPin,
      title: t.findDropPoints,
      description: t.findDropPointsDesc,
      color: "from-secondary to-accent",
    },
    {
      icon: Coins,
      title: t.earnPoints,
      description: t.earnPointsDesc,
      color: "from-primary to-secondary",
    },
    {
      icon: Gift,
      title: t.redeemRewards,
      description: t.redeemRewardsDesc,
      color: "from-secondary to-eco-water",
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/");
    }
  };

  const skipToHome = () => {
    navigate("/");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <Button variant="ghost" onClick={skipToHome} className="text-muted-foreground">
          {t.skip}
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        {/* Animated icon container */}
        <div className="relative mb-12">
          {/* Background glow */}
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-br opacity-20 blur-3xl",
              slide.color
            )}
          />
          
          {/* Icon circle */}
          <div
            className={cn(
              "relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br shadow-elevated animate-scale-in",
              slide.color
            )}
          >
            <Icon className="h-20 w-20 text-primary-foreground animate-float" />
          </div>

          {/* Decorative leaves */}
          <Leaf className="absolute -left-4 top-0 h-8 w-8 text-primary/40 animate-pulse-soft" />
          <Leaf className="absolute -right-2 bottom-4 h-6 w-6 text-secondary/40 animate-pulse-soft" />
        </div>

        {/* Text content */}
        <div className="text-center animate-fade-in-up" key={currentSlide}>
          <h1 className="mb-4 text-3xl font-bold text-foreground">{slide.title}</h1>
          <p className="mx-auto max-w-sm text-muted-foreground leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-8">
        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "w-8 gradient-primary"
                  : "w-2 bg-muted hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* CTA Button */}
        <Button
          onClick={nextSlide}
          size="xl"
          className="w-full gap-2"
        >
          {currentSlide === slides.length - 1 ? t.getStarted : t.next}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
