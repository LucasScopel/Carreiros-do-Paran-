import { Star } from "lucide-react";
import Image from "next/image";

export default function Banner() {
  return (
    <main className="w-full">
      {/*Container da imagem da trilha*/}
      <div className="relative w-full h-[350px] overflow-hidden">
        <Image
          src="/generic-trail-banner.jpg"
          alt="Trail Banner"
          fill
          className="object-cover"
        />

        {/*Nome da trilha e avaliações*/}
        <div className="absolute bottom-3 left-6 text-white">
          <p>Campina Grande do Sul</p>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold">4.5</p>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <p>(2 avaliações)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
