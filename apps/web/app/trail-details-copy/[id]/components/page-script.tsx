"use client";
import React, { useState, useEffect, use } from "react";
import { api } from "@/lib/api/client";
import { TrailReviewResponse, type TrailResponse } from "shared/types";
import { Bookmark, Star, Flame } from "lucide-react";
import { InfoCard } from "./info-card";
import Banner from "./banner";
import StarRating from "./star-rating";
import FlameRating from "./flame-rating";
import SaveIcon from "@/app/components/save-icon";
import SaveModal from "./save-modal";
import SubmitFilledOrangeButton from "@/app/components/submit-filled-orange-button";
import { useMe } from "@/hooks/useMe";
import { UserReview } from "./user-review";

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
  const [trail, setTrail] = useState<TrailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedTrail, setSavedTrail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

    //Se, por algum motivo, não tiver os campos, não tem para que chamar as funções
    if (id) {
      loadTrail();

      if (user) {
        loadUserReview();
      }
    }
  }, [id, user]);

  //Função para alterar o estado de ter ou não uma trilha salva
  const handleSaveTrail = () => {
    //Altera o estado da trilha para salva ou não
    setSavedTrail((prev) => !prev);

    //Só apresenta o modal se for na hora de salvar a trilha
    if (!savedTrail) setIsModalOpen(true);
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
              <InfoCard title="Dificuldade" description="Hardcore"></InfoCard>
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
              <InfoCard title="Avaliações da Comunidade">
                <div className="flex flex-col gap-4 mt-3">
                  {/* Container de realizar avaliação */}

                  <InfoCard variant="container" className="bg-orange-100">
                    <UserReview
                      user={user}
                      userReviewParam={userReview}
                      trailId={id}
                    />
                  </InfoCard>

                  {/* Parte das avaliações de outros usuários */}
                  <p className="text-2xl font-bold text-gray-800">
                    Outras Avaliações
                  </p>

                  <InfoCard>
                    <div className="flex flex-col gap-4">
                      <div className="relative flex flex-col gap-0.5">
                        <div>
                          <h3 className="text-2xl font-bold text-[#263327] leading-tight">
                            João da Silva
                          </h3>
                        </div>

                        <p className="text-sm">5 de maio</p>

                        <div className="absolute top-0 right-0 flex flex-col gap-1">
                          <div className="flex gap-0.5">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="flex gap-0.5">
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                          </div>
                        </div>
                      </div>

                      <p className="text-lg">Boa</p>
                    </div>
                  </InfoCard>

                  <InfoCard>
                    <div className="flex flex-col gap-4">
                      <div className="relative flex flex-col gap-0.5">
                        <div>
                          <h3 className="text-2xl font-bold text-[#263327] leading-tight">
                            Cleide
                          </h3>
                        </div>

                        <p className="text-sm">6 de agosto</p>

                        <div className="absolute top-0 right-0 flex flex-col gap-1">
                          <div className="flex gap-0.5">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="flex gap-0.5">
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
                          </div>
                        </div>
                      </div>

                      <p className="text-lg">Tava fechado</p>
                    </div>
                  </InfoCard>
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
            <div
              onClick={handleSaveTrail}
              className="px-6 py-4 p bg-gray-50 rounded-xl shadow-md border border-[#D99C6A] text-left text-lg text-gray-800 flex gap-2 items-center cursor-pointer
                         focus:border-[#ee8937] focus:outline-none hover:border-[#ee8937] transition-colors duration-300"
            >
              Salvar Trilha
              <div className="ml-auto right-0 pointer-events-none">
                <SaveIcon saved={savedTrail} />
              </div>
            </div>

            {/*Modal para quando salvar a trilha*/}
            <SaveModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
