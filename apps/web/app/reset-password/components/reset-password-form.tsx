"use client";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api/client";
import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedOrangeInput from "@/app/components/rounded-orange-input";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import SubmitFilledOrangeButton from "@/app/components/submit-filled-orange-button";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  //Para debug
  const mockStatus = searchParams.get("mockStatus") as
    | "informing"
    | "waiting"
    | "updating"
    | "success"
    | "error"
    | null;

  //Estados do site
  const [status, setStatus] = useState<
    "informing" | "waiting" | "updating" | "success" | "error"
  >(mockStatus || (token ? "updating" : "informing"));

  //Estado para os dados do formulário
  const [data, setData] = useState({
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  //Função para atualizar qualquer dado digitado
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  //Passa o email para enviar a solicitação
  const handleSendSolicitation = async () => {
    const response = await api.auth.forgotPassword(data.email);

    if (response.ok) {
      setStatus("waiting");
    }
  };

  const handlePasswordUpdate = as;

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

          {status === "informing" && (
            <>
              <h1 className="text-[#263327] text-5xl tracking-wider  font-bold text-center m-0 mb-2">
                Informe o E-mail
              </h1>

              <RoundedOrangeInput
                type="email"
                name="email"
                placeholder="Email"
                value={data.email}
                onChange={handleChange}
                required
              />

              <SubmitFilledOrangeButton
                type="button"
                onClick={handleSendSolicitation}
              >
                Enviar
              </SubmitFilledOrangeButton>
            </>
          )}

          {status === "waiting" && (
            <>
              <h1 className="text-[#263327] text-5xl tracking-wider  font-bold text-center m-0 mb-2">
                Verifique seu E-mail
              </h1>

              <p className="mt-11 text-2xl text-center leading-tight mb-10">
                Enviamos um e-mail para
                <br />
                <a className="text-[#c46518] font-bold">{data.email}</a>
              </p>

              <p className="text-2xl text-center leading-tight mb-10">
                Confira sua caixa de entrada
                <br />e redefina sua senha
              </p>

              <p className="mt-11 mb-0.5 text-center leading-tight">
                Não recebeu o e-mail?
              </p>

              <SubmitFilledOrangeButton
                type="button"
                onClick={handleSendSolicitation}
                className="w-64 h-12"
              >
                Reenviar
              </SubmitFilledOrangeButton>
            </>
          )}

          {status === "updating" && (
            <>
              <h1 className="text-[#263327] text-5xl tracking-wider  font-bold text-center m-0 mb-2">
                Redefinir Senha
              </h1>

              <RoundedOrangeInput
                type="password"
                name="password"
                placeholder="Senha"
                value={data.password}
                onChange={handleChange}
                required
              />

              <RoundedOrangeInput
                type="password"
                name="passwordConfirmation"
                placeholder="Confirme a senha"
                value={data.passwordConfirmation}
                onChange={handleChange}
                required
              />

              <SubmitFilledOrangeButton>Redefinir</SubmitFilledOrangeButton>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-[#263327] text-5xl tracking-wider  font-bold text-center m-0 mb-2">
                Senha Redefinida com Sucesso
              </h1>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-[#263327] text-5xl tracking-wider  font-bold text-center m-0 mb-2">
                Algo deu Errado
              </h1>
            </>
          )}
        </div>
      </MenuWhiteboard>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
