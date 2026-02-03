import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomSwiper from "@/components/shared/custom-swiper";
// New cool card component
import { SpotlightCard } from "@/components/ui/spotlight-card";

export const GameView = ({ challenges, currentIndex, onNavigate }: any) => {
  // We map your challenge text into the format the Swiper needs
  const slides = challenges.map((c: any, i: number) => ({
    id: c._id,
    content: (
      // Wrapping content in a nicer card
      <SpotlightCard className="w-full h-full flex items-center justify-center p-6 text-center text-3xl font-bold text-violet-900 bg-white/90 backdrop-blur-sm">
        {c.text}
      </SpotlightCard>
    ),
  }));

  return (
    <div className="flex flex-col items-center justify-center gap-6 w-full max-w-2xl animate-in fade-in zoom-in duration-500">
      {/* The Swiper Component */}
      <div className="w-full aspect-[3/4] max-h-[60vh]">
        <CustomSwiper
          slides={slides}
          currentIndex={currentIndex}
          onNavigate={onNavigate}
          effect="cards"
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex gap-4 w-full">
        <Button
          variant="outline"
          className="flex-1 h-14 rounded-2xl border-2 border-violet-200 hover:bg-violet-50 text-violet-700"
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="mr-2" /> Forrige
        </Button>
        <Button
          className="flex-1 h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200"
          onClick={() => onNavigate(currentIndex + 1)}
          disabled={currentIndex === challenges.length - 1}
        >
          Neste <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
