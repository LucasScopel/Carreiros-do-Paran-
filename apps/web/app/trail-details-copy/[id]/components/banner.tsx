"use client";
import { Star, ArrowRight, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface BannerProps {
  trailTitle: string;
  rating: number;
  images: {
    id: number;
    url: string;
  }[];
}

export default function Banner({
  trailTitle,
  rating,
  images = [],
}: BannerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Se não houver imagens, exibe um estado vazio ou nulo
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[450px] bg-gray-200 flex items-center justify-center">
        Nenhuma imagem disponível
      </div>
    );
  }

  //Funções para trocar de imagem no banner
  const previousSlide = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const currentSlide = images[currentImageIndex];

  return (
    <main className="w-full">
      {/*Container da imagem da trilha*/}
      <div className="relative w-full h-[450px] overflow-hidden">
        {/*Imagem da trilha*/}
        <Image
          src={currentSlide.url}
          alt={`Imagem da trilha ${trailTitle}`}
          fill
          priority
          unoptimized
          className="object-cover transition-all duration-500"
        />

        {/*Arrows*/}
        {images.length > 1 && (
          <>
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
          </>
        )}

        {/*Nome da trilha e avaliações*/}
        <div className="absolute bottom-3 left-6 text-white z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <h1 className="text-2xl font-bold mb-1">{trailTitle}</h1>
          <div className="flex items-center gap-1.5">
            {/* Exibe a nota formatada com uma casa decimal (ex: 4.5), ou 0 se não houver */}
            <p className="font-semibold">
              {rating > 0 ? rating.toFixed(1) : "Sem notas"}
            </p>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        </div>

        {/* Gradiente escuro no fundo para garantir leitura do texto branco */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>
    </main>
  );
}
