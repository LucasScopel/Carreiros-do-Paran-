import { button, layout } from "./layout";

export function passwordResetTemplate(url: string) {
  return {
    subject: "Recuperação de senha",

    html: layout(
      "Recuperação de senha",

      `
        <p>
          Recebemos uma solicitação para redefinir a senha da sua conta no Carreiros do Paraná.
        </p>

        <p>
          Clique no botão abaixo para criar uma nova senha:
        </p>

        <p>
          ${button(url, "Recuperar senha")}
        </p>
        
        <p>
          Ou abra esta URL: ${url}
        </p>

        <p>
          Se você não solicitou a redefinição de senha, pode ignorar este email com segurança. Sua senha atual permanecerá inalterada.
        </p>

        <p>
          Este link expirará em 24 horas.
        </p>
      `,
    ),
  };
}
