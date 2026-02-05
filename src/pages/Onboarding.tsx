import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Recycle, Coins, MapPin, Gift, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    icon: Recycle,
    title: "Collect Plastic",
    description:
      "Gather plastic waste from your home, community, or anywhere you find it. Every piece counts towards a cleaner planet.",
    color: "from-primary to-secondary",
  },
  {
    icon: MapPin,
    title: "Find Drop Points",
    description:
      "Use our map to locate the nearest collection points. Our network of recycling partners is always ready to receive your plastics.",
    color: "from-secondary to-accent",
  },
  {
    icon: Coins,
    title: "Earn Points",
    description:
      "Get rewarded for every kilogram of plastic you collect. Watch your points grow as you help save the environment.",
    color: "from-primary to-secondary",
  },
  {
    icon: Gift,
    title: "Redeem Rewards",
    description:
      "Exchange your points for airtime, vouchers, or cash. Your environmental efforts pay off in real rewards!",
    color: "from-secondary to-eco-water",
  },
];

export const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

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
          Skip
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
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
