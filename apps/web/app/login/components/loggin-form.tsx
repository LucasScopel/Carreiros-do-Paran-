"use client";
import { useState } from "react";
import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedGreenInput from "@/app/components/rounded-orange-input";
import SubmitFilledGreenButton from "@/app/components/submit-filled-orange-button";
import Image from "next/image";

export default function LogginForm() {
  //Estado para os dados do formulário
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  //Estado para saber se o usuário manterá o login conectado
  const [rememberMe, setRememberMe] = useState(false);

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

    //Reúne os dados do usuário e se quer se manter conectado em uma const para enviar a api
    const userData = {
      email: formData.email,
      password: formData.password,
      rememberMe: rememberMe,
    };

    try {
      //Envia os dados para a api
      const response = await fetch("/api/auth/login/", {
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
        <div className="flex self-center items-center">
          <Image src="/logo.svg" alt="logo" width={80} height={80} />
          <p className="text-2xl">
            CARREIROS <br /> DO PARANÁ
          </p>
        </div>

        <h1 className="text-[#263327] text-5xl tracking-wider  font-bold text-center m-0 mb-2">
          Faça Login
        </h1>
        <p className="text-center leading-tight mb-10">
          Acesse sua conta para
          <br />
          interagir com a comunidade
        </p>

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

        <div className="flex items-center mb-12">
          <input
            type="checkbox"
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 ml-1.5 appearance-none border-2 rounded border-[#424242] hover:border-[#D99C6A] checked:bg-[#D99C6A] checked:border-[#424242] transition-colors duration-300 cursor-pointer"
          />

          <label className="pl-1.5 text-[#D99C6A]">Manter-me conectado</label>

          <a
            href="/forgot-password"
            className="ml-auto mr-1.5 text-[#D99C6A] hover:underline hover:text-[#c46518] hover:brightness-120  transition-all duration-300"
          >
            Esqueceu a senha?
          </a>
        </div>

        <SubmitFilledGreenButton>Login</SubmitFilledGreenButton>

        <label className="text-center text-[#263327]">
          Não tem uma conta?{" "}
          <a
            href="/create-account"
            className="text-[#D99C6A] hover:underline hover:text-[#c46518] hover:brightness-120  transition-all duration-300"
          >
            Cadastre-se aqui!
          </a>
        </label>
      </div>
    </MenuWhiteboard>
  );
}
