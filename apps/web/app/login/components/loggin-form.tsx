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

  //Função para atualizar qualquer dado no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return (
    <MenuWhiteboard>
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
            id="usageTerms"
            className="w-4 h-4 ml-1.5 appearance-none border-2 rounded border-[#424242] hover:border-[#D99C6A] checked:bg-[#D99C6A] checked:border-[#424242] transition-colors duration-300 cursor-pointer"
          />

          <label className="pl-1.5 text-[#D99C6A]">Manter-me conectado</label>

          <a
            href="#"
            className="ml-auto mr-1.5 text-[#D99C6A] hover:underline hover:text-[#c46518] hover:brightness-120  transition-all duration-300"
          >
            Esqueceu a senha?
          </a>
        </div>

        <SubmitFilledGreenButton>Login</SubmitFilledGreenButton>

        <label className="text-center text-[#263327]">
          Não tem uma conta?{" "}
          <a
            href="#"
            className="text-[#D99C6A] hover:underline hover:text-[#c46518] hover:brightness-120  transition-all duration-300"
          >
            Cadastre-se aqui!
          </a>
        </label>
      </div>
    </MenuWhiteboard>
  );
}
