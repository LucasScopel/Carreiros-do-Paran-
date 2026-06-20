import Image from "next/image";
import CreateAccountForm from "./components/create-account-form";

export default function CreateAccountPage() {
  return (
    <div className="relative flex w-full min-h-full items-center justify-center bg-cover bg-center">
      <Image
        src="/login-background.png"
        alt="Background"
        fill
        priority
        className="object-cover -z-10"
      />

      <CreateAccountForm />
    </div>
  );
}
