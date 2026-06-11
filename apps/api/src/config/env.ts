import CONFIG from ".";

/**
 * Todas as variáveis de ambiente necessárias para o funcionamento do backend Express.
 *
 * Caso alguma delas não esteja presente, será exibida uma mensagem
 * relatando quais, e o servidor não será iniciado.
 *
 * Acesse os valores pela variável global {@link CONFIG}.
 */
export const REQUIRED_ENVIRONMENT_VARIABLES = [
  "API_PORT",
  "APP_URL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM",
] as const;

export default REQUIRED_ENVIRONMENT_VARIABLES;
