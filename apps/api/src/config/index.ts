import APP_CONFIG from "./app";
import REQUIRED_ENVIRONMENT_VARIABLES from "./env";

// Verifica se todas as variáveis de ambiente necessárias estão presentes
const missingEnvironmentVariables = REQUIRED_ENVIRONMENT_VARIABLES.filter(
  (name) => !process.env[name],
);

if (missingEnvironmentVariables.length > 0) {
  console.error(
    "Missing environment variables:\n" +
      missingEnvironmentVariables.map((name) => `- ${name}`).join("\n"),
  );

  process.exit(1);
}

type EnvironmentVariables = Record<
  (typeof REQUIRED_ENVIRONMENT_VARIABLES)[number],
  string
>;

const environmentVariables = {} as EnvironmentVariables;

for (const name of REQUIRED_ENVIRONMENT_VARIABLES) {
  environmentVariables[name] = process.env[name]!;
}

// Une as variáveis de ambiente com as configurações da aplicação em um único objeto global
export const CONFIG = {
  ...APP_CONFIG,
  ...environmentVariables,
};

export default CONFIG;
