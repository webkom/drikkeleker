"use client";

import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Virtual, A11y } from "swiper/modules";
import type { SwiperProps } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/effect-cards";
import { Color, getColorClasses } from "@/lib/colors";
import { Songs } from "./SongsProvider";
import SongDetails from "./SongDetails";

interface CustomSwiperProps {
  songs: Songs;
  className?: string;
  creativeEffectConfig?: {
    prev: any;
    next: any;
  };
  swiperOptions?: Omit<
    SwiperProps,
    "effect" | "creativeEffect" | "modules" | "className"
  >;
  onNavigate?: (index: number) => void;
  currentIndex: number;
  color?: Color;
  slideHeight?: string;
}

const SixMinutesSwiper: React.FC<CustomSwiperProps> = ({
  songs,
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
    <Swiper
      grabCursor={true}
      effect="creative"
      creativeEffect={creativeEffectConfig}
      modules={[EffectCards, Virtual, A11y]}
      className="h-full w-full"
      onSlideChange={(swiper) => onNavigate && onNavigate(swiper.activeIndex)}
      initialSlide={currentIndex}
      onSwiper={(swiper) => (swiperRef.current = swiper)}
      watchSlidesProgress={true}
      virtual
      autoHeight={false}
      {...swiperOptions}
    >
      {songs.map((_song, index) => {
        const isCloseToActive =
          index - 1 === currentIndex ||
          index + 1 === currentIndex ||
          index === currentIndex;
        return (
          <SwiperSlide
            key={index}
            virtualIndex={index}
            className="h-full w-full"
          >
            <SongDetails
              currentSong={index}
              loading={isCloseToActive ? "eager" : "lazy"}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default SixMinutesSwiper;
