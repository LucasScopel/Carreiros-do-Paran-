"use client";
import { useState } from "react";
import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedOrangeInput from "@/app/components/rounded-orange-input";
import SubmitFilledOrangeButton from "@/app/components/submit-filled-orange-button";

function CreateAccount() {
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
      alert("As senhas digitadas não são iguais!");
      return;
    }

    if (!acceptTerms) {
      alert("Você precisa aceitar os termos para criar sua conta!");
      return;
    }

    //Reúne os dados do usuário em uma variável que será enviada para a api
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      birthDate: formData.birthDate,
    };

    try {
      const response = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      //Salva a mensagem que a api mandou de volta
      const apiData = await response.json();

      //Erro enviado pela api
      if (!response.ok) {
        //O erro será identificado pela mensagem de erro que a api enviou ou, se não tiver, pelo texto genérico
        throw new Error(apiData.message || "Error when trying to log in");
      }

      console.log("Login sucess", apiData); //Se não deu erro, gg
    } catch (error) {
      console.error(error); //Apresenta o erro lançado no console pros dev

      if (error instanceof Error) {
        //Se for aquele erro que a gente lançou acima
        alert(error.message); //Mostra o erro pro usuário
      } else {
        alert("Erro inesperado"); //Do contrário, mensagem genérica
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
            className="w-4 h-4 ml-1.5 appearance-none border-2 rounded border-[#424242] hover:border-[#D99C6A] checked:bg-[#D99C6A] checked:border-[#424242] transition-colors duration-300 cursor-pointer"
          />

          <label className="pl-3">
            Li e concordo com os{" "}
            <a
              href="#"
              className="text-[#D99C6A] font-bold hover:underline hover:text-[#c46518] hover:brightness-120  transition-all duration-300"
            >
              termos de uso
            </a>
          </label>
        </div>
      </div>
      <SubmitFilledOrangeButton>Criar Conta</SubmitFilledOrangeButton>
    </MenuWhiteboard>
  );
}

export default CreateAccount;
