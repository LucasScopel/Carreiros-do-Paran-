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
              <p className="text-sm">Campina Grande do Sul</p>
              <p className="font-semibold">4.5 Estrelas (2 avaliações)</p>
            </div>
          </div>
        </main>
    );
}