import Image from "next/image";
import LoginForm from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex w-full min-h-full items-center justify-center bg-cover bg-center">
      <Image
        src="/login-background.png"
        alt="Background"
        fill
        priority
        className="object-cover -z-10"
      />

      <LoginForm />
    </div>
  );
}
