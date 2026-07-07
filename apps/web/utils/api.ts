import { execSync } from "child_process";

export function createUser() {
  const name = `e2e_${Date.now().toString(36) + Math.floor(Math.random() * 1000)}`;
  execSync(`cd ../../ && pnpm user create ${name} --verified`);
  console.log(`Criado usuário '${name}'`);
  return [name, `${name}@example.com`];
}

export async function createSessionToken(email: string) {
  const r = await fetch("http://localhost:8081/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: "123456", rememberMe: false }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (r.ok) {
    const setCookies = r.headers.getSetCookie();
    const matches = setCookies[0].match(/sid=[a-z0-9]+/);
    if (matches && matches[0]) {
      console.log("Criado token de sessão");
      return matches[0].split("=")[1];
    }
  }

  throw new Error(`Couldn't create session token ${r.status}`);
}
