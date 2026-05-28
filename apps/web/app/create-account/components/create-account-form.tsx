"use client";
import { useState } from "react";
import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedGreenInput from "@/app/components/rounded-orange-input";
import SubmitFilledGreenButton from "@/app/components/submit-filled-orange-button";

function CreateAccount() {
  //Estado para os dados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passowrdConfirmation: "",
    birthDate: "",
  });

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

    if (formData.password != formData.passowrdConfirmation) {
      alert("As senhas digitadas não são iguais!");
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error returned from server: ", errorData);
        throw new Error(
          errorData.error || `Server's error: ${response.status}`,
        );
      }

      const savedData = await response.json();
      console.log("User successfully created on database!", savedData);
      alert("Usuário cadastrado com sucesso");
    } catch (error) {
      console.error("Requisition fail: ", error);
      alert(`Erro ao conectar ao servidor, tente novamente.\n${error}`);
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
        <RoundedGreenInput
          type="text"
          name="name"
          placeholder="Nome Completo"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <RoundedGreenInput
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <RoundedGreenInput
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <RoundedGreenInput
          type="password"
          name="passowrdConfirmation"
          placeholder="Confirme a senha"
          value={formData.passowrdConfirmation}
          onChange={handleChange}
          required
        />
        <RoundedGreenInput
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
      <SubmitFilledGreenButton>Criar Conta</SubmitFilledGreenButton>
    </MenuWhiteboard>
  );
}

export default CreateAccount;
