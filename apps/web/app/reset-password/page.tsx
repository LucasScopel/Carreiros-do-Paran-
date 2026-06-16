import Image from "next/image";
import ResetPassword from "./components/reset-password-form";

export default function Home() {
  return (
    <div className="relative w-screen h-screen bg-cover bg-center flex justify-center items-center">
      <Image
        src="/login-background.png"
        alt="Background"
        fill
        priority
        className="object-cover -z-10"
      />

      <ResetPassword />
    </div>
  );
}
