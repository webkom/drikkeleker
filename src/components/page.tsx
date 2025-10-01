"use client";

import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCreative,
  EffectCards,
  EffectCoverflow,
  EffectFade,
  EffectFlip,
  EffectCube,
} from "swiper/modules";
import type { SwiperProps } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-creative";
import { Card, CardContent } from "@/components/ui/card";

interface SlideContent {
  id: string | number;
  title?: string;
  content: React.ReactNode;
}

interface CustomSwiperProps {
  slides: SlideContent[];
  effect?:
    | "flip"
    | "creative"
    | "cards"
    | "coverflow"
    | "fade"
    | "cube"
    | "slide";
  className?: string;
  creativeEffectConfig?: {
    prev: any;
    next: any;
  };
  swiperOptions?: Omit<
    SwiperProps,
    "effect" | "creativeEffect" | "modules" | "className"
  >;
  onCardClick?: (id: string | number) => void;
  onNavigate?: (index: number) => void;
  currentIndex: number;
}

const effectModules: Record<string, any> = {
  creative: EffectCreative,
  cards: EffectCards,
  coverflow: EffectCoverflow,
  fade: EffectFade,
  flip: EffectFlip,
  cube: EffectCube,
  slide: undefined,
};

const CustomSwiper: React.FC<CustomSwiperProps> = ({
  slides,
  effect = "creative",
  className = "mySwiper",
  creativeEffectConfig = {
    prev: {
      shadow: true,
      translate: [0, 0, -400],
    },
    next: {
      translate: ["100%", 0, 0],
    },
  },
  swiperOptions = {},
  onCardClick,
  onNavigate,
  currentIndex,
}) => {
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.activeIndex !== currentIndex) {
      swiperRef.current.slideTo(currentIndex);
    }
  }, [currentIndex]);

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <Swiper
        grabCursor={true}
        effect={effect}
        creativeEffect={
          effect === "creative" ? creativeEffectConfig : undefined
        }
        modules={effectModules[effect] ? [effectModules[effect]] : []}
        className="w-full h-[300px]"
        onSlideChange={(swiper) => onNavigate && onNavigate(swiper.activeIndex)}
        initialSlide={currentIndex}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        {...swiperOptions}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <Card className="relative overflow-hidden h-[300px]">
              {slide.title && (
                <div className="absolute top-0 left-0 right-0 bg-violet-500 border-b border-violet-200 px-4 py-2 z-10">
                  <p className="text-sm text-violet-100 font-medium text-center">
                    {slide.title}
                  </p>
                </div>
              )}
              <CardContent className="pt-10 pb-6 px-6 text-xl h-full flex items-center justify-center">
                <div>{slide.content}</div>
              </CardContent>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CustomSwiper;
