"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/api/client";
import MenuWhiteboard from "@/app/components/menu-whiteboard";
import SubmitFilledOrangeButton from "@/app/components/submit-filled-orange-button";
import Image from "next/image";

function VerifyEmailContent() {
  //Utilizados para navegação e manipulação de URL
  const searchParams = useSearchParams();
  const router = useRouter();

  //Isso é para debug, para que possamos navegar entre as telas e editá-las
  const mockStatus = searchParams.get("mockStatus") as
    | "waiting"
    | "loading"
    | "success"
    | "error"
    | null;

  //Captura o email e o token da URL
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  //Possíveis estados que podemos nos deparar com
  const [status, setStatus] = useState<
    "waiting" | "loading" | "success" | "error"
  >(mockStatus || (token ? "loading" : "waiting"));

  //Faz uma chamada para a API enviar um novo email de verificação
  const handleResendVerification = async () => {
    await api.auth.resendVerificationEmail();
    alert("Enviado");
  };

  //Verificação do token
  useEffect(() => {
    //Se não tiver token, nem tem o que fazer
    if (!token) return;

    async function verify() {
      try {
        //Envia o token para a api e armazena a resposta
        const response = await fetch(`/api/verify-email?token=${token}`);
        setStatus(response.ok ? "success" : "error");
      } catch (err) {
        //Se der algo muito errado, avisa
        console.log(err);
        setStatus("error");
      }
    }

    verify();
  }, [token]); //Se o token na URL mudar, obriga o react a executar de novo

  //Função para redirecionar para a tela de login quando a validação der certo
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/login"); //vai para a tela de login
      }, 5000); //após 5 segundos

      return () => clearTimeout(timer); //zera o timer
    }
  }, [status, router]);

  return (
    <div>
      <MenuWhiteboard>
        <div className="space-y-4 flex flex-col">
          <div className="flex self-center items-center">
            <Image src="/logo.svg" alt="logo" width={80} height={80} />
            <p className="text-2xl">
              CARREIROS <br /> DO PARANÁ
            </p>
          </div>

          {status === "waiting" && (
            <>
              <h1 className="text-[#263327] text-4xl tracking-wider  font-bold text-center m-0 mb-2">
                Verifique seu E-mail
              </h1>

              <p className="mt-11 text-2xl text-center leading-tight mb-10">
                Enviamos um e-mail para
                <br />
                <a className="text-[#c46518] font-bold">
                  {email || "o endereço cadastrado"}
                </a>
              </p>

              <p className="text-2xl text-center leading-tight mb-10">
                Confira sua caixa de entrada
                <br />e valide sua conta
              </p>

              <p className="mt-11 mb-0.5 text-center leading-tight">
                Não recebeu o e-mail?
              </p>

              <SubmitFilledOrangeButton
                type="button"
                onClick={handleResendVerification}
                className="w-64 h-12"
              >
                Reenviar
              </SubmitFilledOrangeButton>
            </>
          )}

          {status === "loading" && (
            <>
              <h1 className="text-[#263327] text-4xl tracking-wider  font-bold text-center m-0 mb-2">
                Validando Conta
              </h1>

              <p className="mt-11 text-2xl text-center leading-tight mb-10">
                Aguarde...
              </p>

              <p className="mt-11 text-2xl text-center leading-tight mb-10">
                Estamos verificando seu e-mail
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-[#263327] text-2xl tracking-wider  font-bold text-center m-0 mb-2">
                Conta Validada com Sucesso
              </h1>

              <p className="mt-15 text-2xl text-center leading-tight mb-10">
                Você será redirecionado <br /> para a tela de login em breve
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-[#263327] text-4xl tracking-wider  font-bold text-center m-0 mb-2">
                Algo deu Errado
              </h1>

              <p className="mt-15 text-2xl text-center leading-tight mb-10">
                Este link é inválido ou expirou
              </p>

              <p className="mt-15 text-2xl text-center leading-tight mb-10">
                Clique no botão abaixo para gerar <br /> um novo link de
                verficação
              </p>

              <SubmitFilledOrangeButton
                type="button"
                onClick={handleResendVerification}
                className="w-64 h-12"
              >
                Reenviar
              </SubmitFilledOrangeButton>
            </>
          )}
        </div>
      </MenuWhiteboard>
    </div>
  );
}

//Exporta a página envolvida pelo Suspense, que permite o Next entender como renderizá-lo
//antes de chegar ao front, de fato
export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Carregando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
