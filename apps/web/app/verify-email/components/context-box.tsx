"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/api/client";
import MenuWhiteboard from "@/app/components/menu-whiteboard";
import Image from "next/image";
import { EMAIL_STATES } from "./states";

function VerifyEmailContent() {
  //Utilizados para navegação e manipulação de URL
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  //Captura o email e o token da URL
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  //Possíveis estados que podemos nos deparar com
  const [status, setStatus] = useState<
    "waiting" | "loading" | "success" | "error"
  >(token ? "loading" : "waiting");

  const currentSate = EMAIL_STATES[status];

  //Faz uma chamada para a API enviar um novo email de verificação
  const handleResendVerification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    await api.auth.resendVerificationEmail();

    const params = new URLSearchParams(searchParams.toString());
    params.delete("token");
    router.replace(`${pathName}?${params.toString()}`);
  };

  //Verificação do token
  useEffect(() => {
    async function verify() {
      if (!token) {
        return;
      }

      try {
        //Envia o token para a api e armazena a resposta
        const response = await api.auth.verifyEmail(token);
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

          {currentSate.renderTitle()}
          {currentSate.renderBody(handleResendVerification, email)}
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
