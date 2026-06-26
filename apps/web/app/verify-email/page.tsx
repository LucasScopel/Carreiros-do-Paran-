import VerifyEmail from "./components/context-box";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative w-full min-h-full bg-cover bg-center flex justify-center items-center">
      <Image
        src="/login-background.png"
        alt="Background"
        fill
        priority
        className="object-cover -z-10"
      />

      <VerifyEmail />
    </div>
  );
}
