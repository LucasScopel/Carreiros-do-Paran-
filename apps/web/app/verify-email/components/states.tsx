import React from "react";
import SubmitFilledOrangeButton from "@/app/components/submit-filled-orange-button";

interface EmailVisualState {
  renderTitle(): React.ReactNode;
  renderBody(onResend?: () => void, email?: string | null): React.ReactNode;
}

// 2. Implementação do Estado: Waiting
const WaitingState: EmailVisualState = {
  renderTitle: () => (
    <h1 className="text-center text-4xl font-bold">Verifique seu E-mail</h1>
  ),
  renderBody: (onResend, email) => (
    <>
      <p className="text-2xl text-center mb-16">
        Enviamos um e-mail para{" "}
        <b className="text-[#c46518]">{email || "o cadastrado"}</b>
      </p>

      <p className="text-2xl text-center leading-tight mb-13">
        Confira sua caixa de entrada
        <br />e valide sua conta
      </p>

      <p className="mt-11 mb-0.5 text-center leading-tight">
        Não recebeu o e-mail?
      </p>
      <SubmitFilledOrangeButton
        type="button"
        onClick={() => onResend?.()}
        className="w-64 h-12"
      >
        Reenviar
      </SubmitFilledOrangeButton>
    </>
  ),
};

// 3. Implementação do Estado: Loading
const LoadingState: EmailVisualState = {
  renderTitle: () => (
    <h1 className="text-center text-4xl font-bold">Validando Conta</h1>
  ),
  renderBody: () => (
    <>
      <p className="mt-11 text-2xl text-center leading-tight mb-10">
        Aguarde...
      </p>

      <p className="mt-11 text-2xl text-center leading-tight mb-10">
        Estamos verificando seu e-mail
      </p>
    </>
  ),
};

// 4. Implementação do Estado: Success
const SuccessState: EmailVisualState = {
  renderTitle: () => (
    <h1 className="text-center text-2xl font-bold">
      Conta Validada com Sucesso
    </h1>
  ),
  renderBody: () => (
    <p className="mt-15 text-2xl text-center mb-10">
      Você será redirecionado para seu perfil em breve
    </p>
  ),
};

// 5. Implementação do Estado: Error
const ErrorState: EmailVisualState = {
  renderTitle: () => (
    <h1 className="text-center text-4xl font-bold">Algo deu Errado</h1>
  ),
  renderBody: (onResend) => (
    <>
      <p className="mt-15 text-2xl text-center leading-tight mb-10">
        Este link é inválido ou expirou
      </p>

      <p className="mt-15 text-2xl text-center leading-tight mb-10">
        Clique no botão abaixo para gerar <br /> um novo link de verficação
      </p>
      <SubmitFilledOrangeButton
        type="button"
        onClick={() => onResend?.()}
        className="w-64 h-12"
      >
        Reenviar
      </SubmitFilledOrangeButton>
    </>
  ),
};

// Um dicionário (mapeamento) que funciona como as classes de Estado do padrão
export const EMAIL_STATES: Record<
  "waiting" | "loading" | "success" | "error",
  EmailVisualState
> = {
  waiting: WaitingState,
  loading: LoadingState,
  success: SuccessState,
  error: ErrorState,
};
