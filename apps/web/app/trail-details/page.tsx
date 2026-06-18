import Image from "next/image";

export default function Home() {
  return (
    <main className="w-screen">
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

      {/*Container das informações da trilha*/}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-8">
          {/* Coluna esquerda */}
          <div className="col-span-8">
            {/* Cards */}
            <div className="grid grid-cols-3 gap-4">
              <h1>Dificuldade</h1>
              <h1>Distancia</h1>
              <h1>Duracao</h1>
            </div>

            {/* Sobre */}
            <div className="mt-6">
              <h1>Descricao</h1>
            </div>

            {/* Relatos */}
            <div className="mt-6">
              <h1>Comentarios</h1>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="col-span-4">
            <h1>Localização</h1>
          </div>
        </div>
      </div>
    </main>
  );
}
