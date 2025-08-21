"use client";

import React, {useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {
    EffectCreative,
    EffectCards,
    EffectCoverflow,
    EffectFade,
    EffectFlip,
    EffectCube,
} from 'swiper/modules';

;
import type {SwiperProps} from 'swiper/react';

import 'swiper/css';
import 'swiper/css/effect-creative';
import './styles.css';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

;

interface SlideContent {
    id: string | number;
    title?: string;
    content: React.ReactNode;
}

interface CustomSwiperProps {
    slides: SlideContent[];
    effect?: 'flip' | 'creative' | 'cards' | 'coverflow' | 'fade' | 'cube' | 'slide';
    className?: string;
    creativeEffectConfig?: {
        prev: any;
        next: any;
    };
    swiperOptions?: Omit<SwiperProps, 'effect' | 'creativeEffect' | 'modules' | 'className'>;
    onCardClick?: (id: string | number) => void;
    onNavigate?: (index: number) => void;
    currentIndex: number;
}

const CustomSwiper: React.FC<CustomSwiperProps> = ({
                                                       slides,
                                                       effect = 'creative',
                                                       className = "mySwiper",
                                                       creativeEffectConfig = {
                                                           prev: {
                                                               shadow: true,
                                                               translate: [0, 0, -400],
                                                           },
                                                           next: {
                                                               translate: ['100%', 0, 0],
                                                           }
                                                       },
                                                       swiperOptions = {},
                                                       onCardClick,
                                                       onNavigate,
                                                       currentIndex
                                                   }) => {
    const effectModules: Record<string, any> = {
        creative: EffectCreative,
        cards: EffectCards,
        coverflow: EffectCoverflow,
        fade: EffectFade,
        flip: EffectFlip,
        cube: EffectCube,
        slide: undefined,
    };
    return (
        <div className="w-full max-w-2xl mx-auto my-8">
            <Swiper
                grabCursor={true}
                effect={effect}
                creativeEffect={effect === "creative" ? creativeEffectConfig : undefined}
                modules={effectModules[effect] ? [effectModules[effect]] : []}
                style={{
                    width: "100%",
                    height: "300px",
                }}
                onSlideChange={(swiper) => onNavigate && onNavigate(swiper.activeIndex)}
                initialSlide={currentIndex}
                {...swiperOptions}
            >
                {slides.map((slide, index) => {
                    return (
                        <SwiperSlide key={slide.id}>
                            <Card
                                className="cursor-pointer flex flex-col justify-center h-full  width-full rounded-xl"
                                onClick={() => onCardClick && onCardClick(slide.id)}
                            >
                                {slide.title && (
                                    <CardHeader>
                                        <CardTitle>{slide.title}</CardTitle>
                                    </CardHeader>
                                )}
                                <CardContent>{slide.content}</CardContent>
                            </Card>
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
};
export default CustomSwiper;