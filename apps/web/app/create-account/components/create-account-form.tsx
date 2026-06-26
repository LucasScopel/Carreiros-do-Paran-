"use client";
import { api } from "@/lib/api/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedOrangeInput from "@/app/components/rounded-orange-input";
import SubmitFilledOrangeButton from "@/app/components/submit-filled-orange-button";
import { toast } from "sonner";
import Link from "next/link";

function CreateAccount() {
  const router = useRouter();

  //Estado para os dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    birthDate: "",
  });

  //Estado para aceitar os termos
  const [acceptTerms, setAcceptTerms] = useState(false);

  //Função para atualizar qualquer dado no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  //Função para preparar e enviar os dados para a api
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault(); //Não usa o comportamento padrão do html, que é recarregar a página e perder os dados quando envia

    if (formData.password != formData.passwordConfirmation) {
      toast.warning("As senhas digitadas não são iguais!");
      return;
    }

    if (!acceptTerms) {
      toast.warning("Você precisa aceitar os termos para criar sua conta!");
      return;
    }

    const promise = api.auth.register(
      formData.name,
      formData.email,
      formData.password,
      formData.birthDate,
    );

    toast.promise(promise, {
      loading: "Carregando...",
    });

    const result = await promise;

    //Se der tudo certo, vai redirecionar o usuário para a tela de confirmar email
    //e envia o email digitado para ele ser mostrado na tela
    if (result.ok) {
      toast.success("Conta criada com sucesso.");
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } else {
      if (result.error.code === "EMAIL_TAKEN") {
        toast.error("Já existe uma conta com esse e-mail.");
      } else if (result.error.code === "VALIDATION_ERROR") {
        if (result.error.fields!.email) {
          toast.error("E-mail inválido.");
        }
        if (result.error.fields!.name) {
          toast.error("Nome muito curto ou muito grande.");
        }
        if (result.error.fields!.password) {
          toast.error(
            "Senha muito curta, é necessário pelo menos 6 caracteres.",
          );
        }
        if (result.error.fields!.birthDate) {
          toast.error("Data de nascimento inválida.");
        }
      }
    }
  };

  return (
    <MenuWhiteboard onSubmit={handleSubmit}>
      <div className="space-y-4 flex flex-col">
        <h1 className="text-[#263327] text-4xl  font-bold text-center m-0">
          Crie sua Conta
        </h1>
        <p className="text-center leading-tight mb-5">
          Cadastre-se para
          <br />
          interagir com a comunidade
        </p>
        <RoundedOrangeInput
          type="text"
          name="name"
          placeholder="Nome Completo"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <RoundedOrangeInput
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <RoundedOrangeInput
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <RoundedOrangeInput
          type="password"
          name="passwordConfirmation"
          placeholder="Confirme a senha"
          value={formData.passwordConfirmation}
          onChange={handleChange}
          required
        />
        <RoundedOrangeInput
          type="date"
          name="birthDate"
          placeholder="Data de Nascimento"
          value={formData.birthDate}
          onChange={handleChange}
          required
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="usageTerms"
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="
              w-4 h-4 ml-1.5
              appearance-none
              border-2 rounded border-[#424242] hover:border-[#D99C6A]
              checked:bg-[#D99C6A] checked:border-[#424242]
              transition-colors duration-300
              cursor-pointer
            "
          />

          <label htmlFor="usageTerms" className="pl-3 cursor-pointer">
            Li e concordo com os{" "}
            <Link
              target="_blank"
              href="/usage-terms"
              className="
                text-[#D99C6A] font-bold
                hover:underline hover:text-[#c46518] hover:brightness-120
                transition-all duration-300
              "
            >
              termos de uso
            </Link>
          </label>
        </div>
      </div>
      <SubmitFilledOrangeButton>Criar Conta</SubmitFilledOrangeButton>
    </MenuWhiteboard>
  );
}

export default CreateAccount;
