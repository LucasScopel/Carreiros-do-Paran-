"use client";
import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api/client";
import {
  TrailReviewResponse,
  TrailReviewsResponse,
  type TrailResponse,
} from "shared/types";

import { InfoCard } from "./info-card";
import Banner from "./banner";

import SaveIcon from "@/app/components/save-icon";
import SaveModal from "./save-modal";

import { useMe } from "@/hooks/useMe";
import { UserReview } from "./user-review";
import Comment from "./comment";
import { useRouter, usePathname } from "next/navigation";
import FilterCommentsDropdown from "./filter-comments-dropdown";

export default function PageScript({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const { data: user, error } = useMe(); //Captura os dados do usuário
  const [userReview, setUserReview] = useState<TrailReviewResponse | null>(
    null,
  );
  const [reviews, setReviews] = useState<TrailReviewsResponse | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "star-5" | "star-1" | "diff-5" | "diff-1" | "new" | "old"
  >("all");
  const [trail, setTrail] = useState<TrailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [savedTrail, setSavedTrail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalReference = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathName = usePathname();

  //Cria labels para apresentação da dificuldade
  const labelDifficultyRating = (num: number) => {
    if (num <= 1) return "Muito Fácil";
    if (num <= 2) return "Fácil";
    if (num <= 3) return "Média";
    if (num <= 4) return "Difícil";
    return "Muito Difícil";
  };

  //Guarda as reviews conforme o filtro selecionado
  const filteredReviews =
    reviews?.reviews.filter((review) => {
      if (activeFilter === "star-5") return review.rating === 5;
      if (activeFilter === "star-1") return review.rating === 1;
      if (activeFilter === "diff-5") return review.difficultyRating === 5;
      if (activeFilter === "diff-1") return review.difficultyRating === 1;
      return true; // "all" retorna tudo
    }) || [];

  // Função isolada para checar se a trilha está salva em alguma coleção do usuário
  async function checkSavedStatus() {
    if (!user || !id) return;
    try {
      const result = await api.users.collections.getContainingTrail(id);
      if (result.ok) {
        // Se ao menos uma coleção tiver "containsTrail: true", a trilha está salva
        const isSaved = result.data.some((col) => col.containsTrail);
        setSavedTrail(isSaved);
      }
    } catch (error) {
      console.error("Erro ao checar status de salvamento:", error);
    }
  }

  useEffect(() => {
    //Função para pegar os dados da trilha na api
    async function loadTrail() {
      try {
        //Coloca em estado de loading e pega os dados
        setLoading(true);
        const result = await api.trails.get(id);

        //Como a api retorna os dados "encapsulado" por um "status",
        //primeiro, checamos se, de fato, ela retornou tudo corretamente
        if (result.ok)
          setTrail(result.data); //Se estiver tudo certo, pegamos os dados
        else console.error("API error status:", result.status); //Do contrário, erro da api
      } catch (error) {
        console.error("Network error:", error); //Se nem chegar na api, erro na comunicação
      } finally {
        setLoading(false); //Finaliza saindo do status de loading
      }
    }

    //Função para pegar os dados da review na api
    async function loadUserReview() {
      try {
        const result = await api.trails.reviews.getMine(id);

        // Se der certo, guarda o a review
        if (result.ok) {
          setUserReview(result.data);
        } else {
          // Se der erro 404 (não encontrado), significa apenas que ele não avaliou ainda
          setUserReview(null);
        }
      } catch (error) {
        console.error("Erro ao buscar review do usuário:", error); //Se nem chegar na api, erro na comunicação
        setUserReview(null);
      }
    }

    //Função para pegas as demais reviews
    async function loadAllReviews() {
      try {
        //Chamada da api
        const result = await api.trails.reviews.get(id);

        if (result.ok) {
          setReviews(result.data);
        }
      } catch (error) {
        console.error("Erro ao buscar todas as avaliações:", error);
      }
    }

    //Função para fechar o dropdown caso clique fora
    function handleClickOutside(event: MouseEvent) {
      // Se existir uma referência e o elementos clicado estiver fora dela, fecha o dropboxwh
      if (
        modalReference.current &&
        !modalReference.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    }

    //Se, por algum motivo, não tiver os campos, não tem para que chamar as funções
    if (id) {
      loadTrail();
      loadAllReviews();

      if (user) {
        loadUserReview();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkSavedStatus();
      }
    }

    //Toda vez que o navegador perceber um clique, roda o comando.
    document.addEventListener("mousedown", handleClickOutside);

    //Ao fechar o dropdown, "limpa" o comando
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [id, user]);

  //Função para alterar o estado de ter ou não uma trilha salva
  const handleSaveTrail = () => {
    if (!savedTrail) setSavedTrail(true);

    setIsModalOpen(true);
  };

  //Controle visual dos estados para renderização
  if (loading)
    return <div className="text-center p-10 text-white">Loading...</div>;
  if (!trail)
    return <div className="text-center p-10 text-white">Trail not found</div>;

  return (
    <main className="w-full">
      {/* Imagem da trilha */}
      {/* -RECEBER DA API- */}
      <Banner
        trailTitle={trail.name}
        rating={trail.rating}
        images={trail.images}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-8">
          {/* --------------- */}
          {/* Coluna esquerda */}
          {/* --------------- */}

          <div className="col-span-8">
            {/* Cards mais quadrados */}
            <div className="grid grid-cols-3 gap-4">
              <InfoCard
                title="Dificuldade"
                description={labelDifficultyRating(trail.difficulty)}
              ></InfoCard>
              <InfoCard
                title="Distância"
                description={`${trail.length.toString()} Km`}
              ></InfoCard>
              <InfoCard
                title="Duração"
                description={`${trail.duration.toString()} Minutos`}
              ></InfoCard>
            </div>

            {/* Descrição da trilha */}
            <div className="mt-6 mb">
              <InfoCard
                title="Detalhes da Trilha"
                description={trail.description}
              ></InfoCard>
            </div>

            {/* Container das avaliações */}
            <div className="mt-6 mb">
              <InfoCard title="Sua avaliação">
                <div className="flex flex-col gap-4 mt-3">
                  {/* Container de realizar avaliação */}

                  <InfoCard
                    variant="container"
                    bgColor={
                      user ? "bg-green-100 border-green-900" : "bg-orange-100"
                    }
                  >
                    <UserReview
                      user={user}
                      userReviewParam={userReview}
                      trailId={id}
                    />
                  </InfoCard>

                  {/* Parte das avaliações de outros usuários */}
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold text-gray-800">
                      Avaliações dos Usuários
                    </p>

                    <FilterCommentsDropdown
                      currentFilter={activeFilter}
                      onFilterChange={setActiveFilter}
                    />

                    {/*
                    <button className="w-50 px-6 py-3 rounded-xl shadow-md border text-left text-lg cursor-pointer focus:outline-none bg-gray-50 border-[#D99C6A] text-gray-800 font-medium hover:border-[#ff8119] hover:bg-gray-200 duration-200 transition-all">
                      Filtrar
                    </button>
*/}
                  </div>
                  {/* Verifica se existem reviews na trilha e renderiza dinamicamente */}
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map(
                      (review: TrailReviewResponse, index: number) => (
                        <InfoCard key={`Review-${index}`}>
                          <Comment review={review} />
                        </InfoCard>
                      ),
                    )
                  ) : (
                    <p className="text-sm text-zinc-500 italic p-4 text-center">
                      Nenhum comentário encontrado para este filtro.
                    </p>
                  )}
                </div>
              </InfoCard>
            </div>
          </div>

          {/* -------------- */}
          {/* Coluna direita */}
          {/* -------------- */}

          <div className="col-span-4 flex flex-col gap-4">
            {/*Mapa e coordenadas*/}
            <InfoCard title="Mapa">
              <div className="flex-1 w-full">
                <iframe
                  src={`https://maps.google.com/maps?q=${trail.coordinates.lat},${trail.coordinates.lon}&z=15&output=embed`}
                  className="w-full h-100 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                <p className="text-lg font-bold text-[#263327] mt-3">
                  {trail.name}
                </p>
                <p className="text-sm mb-3">{trail.address}</p>

                <p className="text-lg font-bold text-[#263327]">Coordenadas</p>
                <p className="text-sm">Lat: {trail.coordinates.lat}°</p>
                <p className="text-sm">Lng: {trail.coordinates.lon}°</p>
              </div>
            </InfoCard>

            {/*Botão de salvar trilha*/}
            <button
              onClick={() =>
                user
                  ? setIsModalOpen(true)
                  : router.push(
                      `/login?redirect=${encodeURIComponent(pathName)}`,
                    )
              }
              className={`w-full px-6 py-4 rounded-xl shadow-md border text-left text-lg flex gap-2 items-center cursor-pointer 
                transition-all duration-300 focus:outline-none
                ${
                  savedTrail
                    ? "bg-green-500 border-green-700 text-white font-semibold hover:brightness-108 transition-all"
                    : "bg-gray-50 border-[#D99C6A] text-gray-800 font-medium hover:border-[#ff8119] hover:bg-gray-200 duration-200 transition-all"
                }`}
            >
              {savedTrail ? "Salva" : "Salvar Trilha"}
              <div className="ml-auto">
                {/* Passando asChild para evitar o erro de botões aninhados */}
                <SaveIcon saved={savedTrail} asChild />
              </div>
            </button>

            {/*Modal para quando salvar a trilha*/}
            <SaveModal
              modalRef={modalReference}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              trailId={id}
              onRefreshStatus={checkSavedStatus}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
