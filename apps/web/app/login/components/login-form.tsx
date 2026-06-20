"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";
import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedOrangeInput from "@/app/components/rounded-orange-input";
import SubmitFilledOrangeButton from "@/app/components/submit-filled-orange-button";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    const result = await api.auth.login(
      formData.email,
      formData.password,
      rememberMe,
    );

    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <MenuWhiteboard>
      {/* Mantido como div para não dar conflito com o form do MenuWhiteboard */}
      <div className="space-y-4 flex flex-col">
        <div className="flex self-center items-center">
          <Image src="/logo.svg" alt="logo" width={80} height={80} />
          <p className="text-2xl">
            CARREIROS <br /> DO PARANÁ
          </p>
        </div>

        <h1 className="text-[#263327] text-5xl tracking-wider font-bold text-center m-0 mb-2">
          Faça Login
        </h1>
        <p className="text-center leading-tight mb-10">
          Acesse sua conta para
          <br />
          interagir com a comunidade
        </p>

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

        <div className="flex items-center mb-12">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="
              w-4 h-4 ml-1.5
              border-2 rounded border-[#424242] hover:border-[#D99C6A]
              appearance-none
              checked:bg-[#D99C6A] checked:border-[#424242]
              transition-colors duration-300 cursor-pointer
            "
          />
          <label
            htmlFor="rememberMe"
            className="pl-1.5 text-[#263327] cursor-pointer"
          >
            Manter-me conectado
          </label>

          <Link
            href="/forgot-password"
            className="ml-auto mr-1.5 text-[#D99C6A] hover:underline hover:text-[#c46518] hover:brightness-120 transition-all duration-300"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <SubmitFilledOrangeButton type="button" onClick={handleLogin}>
          Login
        </SubmitFilledOrangeButton>

        <label className="text-center text-[#263327]">
          Não tem uma conta?{" "}
          <Link
            href="/create-account"
            className="text-[#D99C6A] hover:underline hover:text-[#c46518] hover:brightness-120 transition-all duration-300"
          >
            Cadastre-se aqui!
          </Link>
        </label>
      </div>
    </MenuWhiteboard>
  );
}
