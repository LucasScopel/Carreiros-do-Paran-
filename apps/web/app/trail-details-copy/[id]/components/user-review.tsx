import { toast } from "sonner";
import { useEffect, useState } from "react";
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

  //Se o usuário já tiver feito review, pega os dados
  useEffect(() => {
    console.log("userReviewParam", userReviewParam);
    if (userReviewParam) {
      setStarRating(userReviewParam.rating || 0);
      setFlameRating(userReviewParam.difficultyRating || 0);
      setReview(userReviewParam.comment || "");
    } else {
      // Se mudar de trilha ou deslogar, limpa o formulário
      setStarRating(0);
      setFlameRating(0);
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

    // Criamos a promise para usar o mesmo efeito de "Carregando..." do toast
    const promise = api.trails.reviews.upsert(trailId, reviewData);

    toast.promise(promise, {
      loading: "Salvando sua avaliação...",
    });

    const result = await promise;
    console.log("RETORNO COMPLETO DA API:", result);

    if (result.ok) {
      toast.success("Avaliação salva com sucesso!");
      // Opcional: Se quiser dar um refresh nos dados da página:
      // router.refresh(); (vindo do useRouter do next/navigation)
    } else {
      // Tratamento de erro baseado na estrutura que você já usa
      if (result.error?.code === "VALIDATION_ERROR") {
        toast.error("Verifique se preencheu todos os campos corretamente.");
      } else {
        toast.error("Não foi possível salvar sua avaliação no momento.");
      }
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
      {userReviewParam ? (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 mt-3">
            <div className="flex justify-between">
              <div>
                <p className="text-xl text-black">Sua Avaliação</p>
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
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center">
            <h3 className="text-2xl text-center font-bold text-[#263327]">
              Conte a sua Experienica
            </h3>
            <p className="text-center mb-8">
              Faça login para poder deixar uma avaliação
            </p>

            <button
              type="submit"
              className="py-2 rounded-md mx-auto mt-auto bg-[#D99C6A] text-white font-bold w-48
                        cursor-pointer hover:bg-[#c46518] hover:brightness-120  transition-all duration-300"
            >
              Fazer Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
