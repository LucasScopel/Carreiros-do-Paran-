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
      {/* Clickable Profile Picture */}
      <a href={`/users/${user.publicId}`}>
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-zinc-200 border border-zinc-300">
          <img
            src={avatarSrc}
            alt={`Foto de perfil de ${user.name}`}
            className="w-full h-full object-cover"
          />
        </div>
      </a>

      {/* Review Content */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Top row */}
        <div className="flex justify-between items-start gap-4">
          {/* Clickable Name + Date */}
          <a href={`/users/${user.publicId}`} className="min-w-0">
            <h3 className="text-xl font-bold text-[#263327] leading-tight">
              {user.name}
            </h3>
            <p className="text-xs text-zinc-500">{formattedDate}</p>
          </a>

          {/* Stars + Flames */}
          <div className="flex flex-col gap-1 items-end flex-shrink-0">
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

        {/* Comment */}
        <p className="text-gray-700 text-base text-justify whitespace-pre-wrap wrap-break-words mt-3">
          {comment}
        </p>
      </div>
    </div>
  );
}
