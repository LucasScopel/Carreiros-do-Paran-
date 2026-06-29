"use client";

import React from "react";
import { Star, Flame } from "lucide-react";
import { getUserAvatarURL } from "shared/utils";
import Image from "next/image";
import { TrailReviewResponse } from "shared/types";

interface CommentProps {
  review: TrailReviewResponse;
}

export default function Comment({ review }: CommentProps) {
  //Separa os campos da review para serem chamados separadamente
  const { user, comment, rating, difficultyRating, visitDate } = review;

  //Verifica se tem foto de perfil personalizada e caminho até ela
  const avatarSrc = user.avatarUrl
    ? user.avatarUrl
    : getUserAvatarURL({ hasAvatar: false, name: user.name });

  //Formatação da data e da hora para apresentar
  const formattedDate = visitDate
    ? new Date(visitDate).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
      })
    : "";

  return (
    <div className="flex gap-4 items-start w-full">
      {/* Imagem do Perfil */}
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-zinc-200 border border-zinc-300">
        <img
          src={avatarSrc}
          alt={`Foto de perfil de ${user.name}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Conteúdo da Avaliação */}
      <div className="flex-1 relative flex flex-col gap-1">
        <div>
          <h3 className="text-xl font-bold text-[#263327] leading-tight">
            {user.name}
          </h3>
          <p className="text-xs text-zinc-500">{formattedDate}</p>
        </div>

        {/* Texto do comentário */}
        <p className="text-gray-700 mt-2 text-base">{comment}</p>

        {/* Estrelas e Chamas alinhadas à direita */}
        <div className="absolute top-0 right-0 flex flex-col gap-1 items-end">
          {/* Estrelas (Rating) */}
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-zinc-300"
                }`}
              />
            ))}
          </div>

          {/* Chamas (Dificuldade) */}
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Flame
                key={index}
                className={`w-4 h-4 ${
                  index < difficultyRating
                    ? "text-red-600 fill-red-600"
                    : "text-zinc-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
