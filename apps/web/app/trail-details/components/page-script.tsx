"use client";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import Banner from "./banner";
import { InfoCard } from "./info-card";
import StarRating from "./star-rating";
import FlameRating from "./flame-rating";
import SaveIcon from "@/app/components/save-icon";
import SaveModal from "./save-modal";

export default function PageScript() {
  const [starRating, setStarRating] = useState(0);
  const [flameRating, setFlameRating] = useState(0);
  const [savedTrail, setSavedTrail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [review, setReview] = useState("");

  //Função para alterar o estado de ter ou não uma trilha salva
  const handleSaveTrail = () => {
    //Altera o estado da trilha para salva ou não
    setSavedTrail((prev) => !prev);

    //Só apresenta o modal se for na hora de salvar a trilha
    if (!savedTrail) setIsModalOpen(true);
  };

  /* FUNÇÃO PARA ENVIAR OS DADOS PRA API
  const handleSubmit = async () => {
    const result = await api.algumaCoisa(
      starRating, 
      flameRating, 
      review,
    );
  };
  */

  return (
    <main className="w-full">
      {/* Imagem da trilha */}
      {/* -RECEBER DA API- */}
      <Banner />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-8">
          {/* --------------- */}
          {/* Coluna esquerda */}
          {/* --------------- */}

          <div className="col-span-8">
            {/* Cards mais quadrados */}
            <div className="grid grid-cols-3 gap-4">
              <InfoCard title="Dificuldade" description="Hardcore"></InfoCard>
              <InfoCard title="Distância" description="1.5 Km"></InfoCard>
              <InfoCard title="Duração" description="30 Minutos"></InfoCard>
            </div>

            {/* Descrição da trilha */}
            <div className="mt-6 mb">
              <InfoCard
                title="Detalhes da Trilha"
                description="Um monte de texto aqui sgfgafd sas a a saf ssfdsfsdf a safsdfsd fsdfsdfsdf  asfsad fsffsd fs sas  sdfsfsfsdfsa safdsfsafds  fsa fs s"
              ></InfoCard>
            </div>

            {/* Container das avaliações */}
            <div className="mt-6 mb">
              <InfoCard title="Avaliações da Comunidade">
                <div className="flex flex-col gap-4 mt-3">
                  {/* Container de realizar avaliação */}

                  <InfoCard
                    variant="container"
                    title="Conte a sua Experiência"
                    className="bg-green-100 border-green-900"
                  >
                    <div className="flex flex-col gap-4 mt-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xl text-black">Sua Avaliação</p>
                          <StarRating
                            value={starRating}
                            onChange={setStarRating}
                          />
                        </div>

                        <div>
                          <p className="text-xl text-black">
                            O quão difícil achou
                          </p>
                          <FlameRating
                            value={flameRating}
                            onChange={setFlameRating}
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-xl text-black">
                          Quando você fez a trilha
                        </p>
                        <input
                          type="date"
                          className="w-55 px-4 py-3 border-2 rounded-md text-black border-green-900 bg-green-50 focus:border-green-700 focus:outline-none hover:border-green-600 
                        transition-colors duration-300"
                        ></input>
                      </div>

                      <div>
                        <p className="text-xl text-black">Seu relato</p>
                        <textarea
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          className="w-full h-36 px-4 py-4 border-2 rounded-md text-black border-green-900 bg-green-50 focus:border-green-700 focus:outline-none hover:border-green-600 
                                     transition-colors duration-300"
                        ></textarea>
                      </div>

                      <button className="w-full px-4 py-4 rounded-md text-center bg-green-800 font-bold text-white cursor-pointer hover:bg-green-700 hover:brightness-120  transition-all duration-300">
                        Avaliar
                      </button>
                    </div>
                  </InfoCard>

                  {/* Parte das avaliações de outros usuários */}
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

          <div className="col-span-4 flex flex-col gap-4">
            {/*Mapa e coordenadas*/}
            <InfoCard title="Mapa">
              <div className="flex-1 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=..."
                  className="w-full h-100 border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                <p className="text-lg font-bold text-[#263327] mt-3">
                  Campina Grande do Sul
                </p>
                <p className="text-sm mb-3">Paraná, Brasil</p>

                <p className="text-lg font-bold text-[#263327]">Coordenadas</p>
                <p className="text-sm">Lat: -25.2486°</p>
                <p className="text-sm">Lng: -48.8820°</p>
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
