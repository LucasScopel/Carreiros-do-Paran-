import Image from "next/image";
import CreateTrailForm from "./components/create-trail-form";

export default function CreateTrailPage() {
  return (
    <div className="relative w-screen h-screen bg-cover bg-center flex justify-center items-center">
      <Image
        src="/create-trail-background.png"
        alt="CrateTrailBackground"
        fill
        priority
        className="object-cover -z-10"
      />

      <CreateTrailForm />
    </div>
  );
}