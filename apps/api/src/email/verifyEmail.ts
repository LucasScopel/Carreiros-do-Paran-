import { button, layout } from "./layout";

export function verifyEmailTemplate(url: string) {
  return {
    subject: "Verifique seu email",

    html: layout(
      "Verifique seu email",

      `
        <p>
          Seja bem-vindo ao Carreiros do Paraná.
        </p>

        <p>
          Clique abaixo para verificar seu email:
        </p>

        <p>
          ${button(url, "Verificar email")}
        </p>

        <p>
          Ou abra esta URL: ${url}
        </p>

        <p>
          Esté link expirará em 24 horas.
        </p>
      `,
    ),
  };
}
