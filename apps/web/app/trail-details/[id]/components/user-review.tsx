"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TrailReviewResponse } from "shared/types";
import { api } from "@/lib/api/client";
import StarRating from "./star-rating";
import FlameRating from "./flame-rating";

interface userReviewProps {
  user: any;
  userReviewParam: TrailReviewResponse | null;
  trailId: string;
}

export function UserReview({
  user,
  userReviewParam,
  trailId,
}: userReviewProps) {
  const [starRating, setStarRating] = useState(0);
  const [flameRating, setFlameRating] = useState(0);
  const [visitDate, setVisitDate] = useState("");
  const [review, setReview] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const pathName = usePathname();

  //Se o usuário já tiver feito review, pega os dados
  useEffect(() => {
    console.log("userReviewParam", userReviewParam);
    if (userReviewParam) {
      setStarRating(userReviewParam.rating || 0);
      setFlameRating(userReviewParam.difficultyRating || 0);
      setVisitDate(userReviewParam.visitDate || "");
      setReview(userReviewParam.comment || "");
    } else {
      // Se mudar de trilha ou deslogar, limpa o formulário
      setStarRating(0);
      setFlameRating(0);
      setVisitDate("");
      setReview("");
    }
  }, [userReviewParam]);

  //Função para enviar os dados à api
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!review.trim()) {
      toast.warning("Por favor, escreva um comentário antes de enviar.");
      return;
    }

    // Prepara os dados para enviar à api
    const reviewData = {
      comment: review,
      rating: starRating,
      difficultyRating: flameRating,
      visitDate: visitDate,
    };

    //Promise para usar o mesmo efeito de "Carregando..." do toast
    const promise = api.trails.reviews.upsert(trailId, reviewData);

    toast.promise(promise, {
      loading: "Salvando sua avaliação...",
    });

    const result = await promise;

    if (result.ok) {
      toast.success("Avaliação salva com sucesso!");
      router.refresh();
    } else {
      //Erro em envolvendo o salvamento dos dados na api
      if (result.error?.code === "VALIDATION_ERROR") {
        toast.error("Verifique se preencheu todos os campos corretamente.");
      } else {
        //Nem chegou na api
        toast.error("Não foi possível salvar sua avaliação no momento.");
      }
    }
  };

  //Função para exluir uma trilha
  const handleDelete = async () => {
    //Chamada da api para exluir a triha
    const promise = api.trails.reviews.delete(trailId);

    toast.promise(promise, {
      loading: "Excluindo sua avaliação...",
    });

    const result = await promise;

    if (result.ok) {
      toast.success("Avaliação excluída com sucesso!");
      router.refresh();
    } else {
      toast.error("Não foi possível excluir sua avaliação no momento.");
    }
  };

  if (user === undefined) {
    return <p>Carregando dados do usuário...</p>;
  }

  if (user === null) {
    return (
      <div className="flex flex-col items-center">
        <h3 className="text-2xl text-center font-bold text-[#263327]">
          Conte a sua Experienica
        </h3>
        <p className="text-center mb-8">
          Faça login para poder deixar uma avaliação
        </p>

        <button
          onClick={() =>
            router.push(`/login?redirect=${encodeURIComponent(pathName)}`)
          }
          className="py-2 rounded-md mx-auto mt-auto bg-[#D99C6A] text-white font-bold w-48
                   cursor-pointer hover:bg-[#c46518] hover:brightness-120  transition-all duration-300"
        >
          Fazer Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between">
            <div>
              <p className="text-xl text-black">Opinião Geral</p>
              <StarRating value={starRating} onChange={setStarRating} />
            </div>

            <div>
              <p className="text-xl text-black">O quão difícil achou</p>
              <FlameRating value={flameRating} onChange={setFlameRating} />
            </div>
          </div>

          <div>
            <p className="text-xl text-black">Quando você fez a trilha</p>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
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

          <button
            type="submit"
            className="w-full px-4 py-4 rounded-md text-center bg-green-800 font-bold text-white cursor-pointer hover:bg-green-700 hover:brightness-120  transition-all duration-300"
          >
            {userReviewParam ? "Salvar Alterações" : "Avaliar"}
          </button>

          {userReviewParam && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full px-4 py-4 rounded-md text-center bg-red-700 font-bold text-white cursor-pointer hover:bg-red-600 hover:brightness-120  transition-all duration-300"
            >
              Excluir Avaliação
            </button>
          )}
        </div>
      </form>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-110 w-full mx-4 shadow-xl border border-gray-100">
            <h1 className="text-[#263327] text-4xl font-bold m-0 text-center mb-4">
              Excluir Avaliação
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Tem certeza que deseja excluir sua avaliação?
              <br />
              Esta ação não poderá ser desfeita.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 w-25 text-sm font-semibold text-white bg-green-800 rounded-md hover:bg-green-700 hover:brightness-120 transition-all duration-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 w-25 text-sm font-semibold text-white bg-red-700 rounded-md hover:bg-red-600 hover:brightness-140 transition-all duration-300 cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
