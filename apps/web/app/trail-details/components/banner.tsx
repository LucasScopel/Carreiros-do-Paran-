"use client";
import { Star, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const BANNER_IMAGES = [
  { src: "/generic-trail-banner.jpg", title: "Image 1" },
  { src: "/other-trail-banner.jpg", title: "Image 2" },
  { src: "/third-trail-banner.jpg", title: "Image 3" },
];

export default function Banner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  //Funções para trocar de imagem no banner
  const previousSlide = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? BANNER_IMAGES.length - 1 : prev - 1,
    );
  };

  const nextSlide = () => {
    setCurrentImageIndex((prev) =>
      prev === BANNER_IMAGES.length - 1 ? 0 : prev + 1,
    );
  };

  const currentSlide = BANNER_IMAGES[currentImageIndex];

  return (
    <main className="w-full">
      {/*Container da imagem da trilha*/}
      <div className="relative w-full h-[450px] overflow-hidden">
        {/*Imagem da trilha*/}
        <Image
          src={currentSlide.src}
          alt={currentSlide.title}
          fill
          className="object-cover transition-all duration-500"
        />

        {/*Arrows*/}
        <button
          onClick={previousSlide}
          aria-label="Previous Image"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition z-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Image"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition z-10"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        {/*Nome da trilha e avaliações*/}
        <div className="absolute bottom-3 left-6 text-white">
          <p>{currentSlide.title}</p>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold">4.5</p>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <p>(2 avaliações)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
