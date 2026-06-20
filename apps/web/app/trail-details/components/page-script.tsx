"use client";
import { useState } from "react";
import Banner from "./banner";
import { InfoCard } from "./info-card";
import Rating from "./rating";

export default function PageScript() {
  const [rating, setRating] = useState(0);

  return (
    <main className="w-full">
      <Banner />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-8">
          {/* --------------- */}
          {/* Coluna esquerda */}
          {/* --------------- */}

          <div className="col-span-8">
            {/* Cards */}
            <div className="grid grid-cols-3 gap-4">
              <InfoCard title="Dificuldade" description="Hardcore"></InfoCard>
              <InfoCard title="Distância" description="1.5 Km"></InfoCard>
              <InfoCard title="Duração" description="30 Minutos"></InfoCard>
            </div>

            {/* Descrição */}
            <div className="mt-6 mb">
              <InfoCard
                title="Detalhes da Trilha"
                description="Um monte de texto aqui sgfgafd sas a a saf ssfdsfsdf a safsdfsd fsdfsdfsdf  asfsad fsffsd fs sas  sdfsfsfsdfsa safdsfsafds  fsa fs s"
              ></InfoCard>
            </div>

            <div className="mt-6 mb">
              <InfoCard title="Avaliações da Comunidade">
                <div className="flex flex-col gap-4 mt-3">
                  <InfoCard
                    variant="container"
                    title="Conte a sua Experiência"
                    className="bg-green-100"
                  >
                    <div className="flex flex-col gap-4 mt-3">
                      <p className="text-xl text-black">Sua Avaliação</p>
                      <Rating value={rating} onChange={setRating} />
                      <p className="text-xl text-black">Seu relato</p>
                      <input
                        className="w-full px-4 py-2 border-2 rounded-md text-black border-green-900 bg-green-50 focus:border-green-700 focus:outline-none hover:border-green-600 
                  transition-colors duration-300"
                      ></input>

                      <button className="w-full px-4 py-2 rounded-md text-center bg-green-800 font-bold text-white cursor-pointer hover:bg-green-700 hover:brightness-120  transition-all duration-300">
                        Avaliar
                      </button>
                    </div>
                  </InfoCard>

                  <p className="text-2xl font-bold text-gray-800">
                    Outras Avaliações
                  </p>

                  <InfoCard title="João">
                    <div className="flex flex-col gap-4">
                      <p className="text-sm">5 de maio</p>
                      <p className="text-lg">Boa</p>
                    </div>
                  </InfoCard>
                  <InfoCard title="Cleide">
                    <div className="flex flex-col gap-4">
                      <p className="text-sm">6 de agosto</p>
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

          <div className="col-span-4">
            <InfoCard title="Mapa" description="Coordenada x e y"></InfoCard>
          </div>
        </div>
      </div>
    </main>
  );
}
