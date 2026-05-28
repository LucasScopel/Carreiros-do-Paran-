"use client"; 
import { useState } from "react";
import MenuWhiteboard from "@/app/components/menu-whiteboard";
import RoundedGreenInput from "@/app/components/rounded-orange-input";
import SubmitFilledGreenButton from "@/app/components/submit-filled-orange-button";


export default function LogginForm(){
    //Estado para os dados do formulário
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    }); 

    //Função para atualizar qualquer dado no formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target; 

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        })); 
    }

    return(
        <MenuWhiteboard>
            <h1 className="font-bold text-center">Login</h1>
                    
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

            <SubmitFilledGreenButton>Login</SubmitFilledGreenButton>
        </MenuWhiteboard>
    )
}