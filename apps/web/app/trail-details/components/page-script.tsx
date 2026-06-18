import Banner from "./banner";
import InfoCard from "./info-card";

export default function Layout() {
  return (
    <main className="w-full">
        <Banner />

      <div className="max-w-7xl mx-auto p-6">
  <div className="grid grid-cols-12 gap-8">

    {/* Coluna esquerda */}
    <div className="col-span-8">
      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <InfoCard
        title="Dificuldade"
        value="Muito Difícil"
        />

        <InfoCard
        title="Distância"
        value="Logo ali"
        />

        <InfoCard
        title="Tempo médio"
        value="Meia hora"
        />
      </div>

      {/* Descrição */}
      <div className="mt-6">
        <InfoCard
        title="Detalhes"
        value="mt daora"
        />
        
      </div>

      {/* Adicionar Comentário */}
      <div className="mt-15">
        <InfoCard
        title="Adicionar Comentário"
        value="Minha review"
        />
        
      </div>

      {/* Relatos */}
      <div className="mt-4">
        <div className="space-y-2">
          <InfoCard
            title="fulano"
            value="tava fechado"
          />

          <InfoCard
            title="fulano"
            value="tava fechado"
          />

          <InfoCard
            title="fulano"
            value="tava fechado"
          />
        </div>
      </div>
      
    </div>

    {/* Coluna direita */}
    <div className="col-span-4">
      <InfoCard
        title="no mapa"
        value="coordenada x e y"
        />
    </div>

  </div>
</div>
    </main>
  );
}
