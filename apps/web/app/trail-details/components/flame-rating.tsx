import { Flame } from "lucide-react";

interface FlameRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export default function FlameRating({ value, onChange }: FlameRatingProps) {
  //Verifica se clicou na direita ou na esquerda da chama
  const handleClick = (
    e: React.MouseEvent<SVGSVGElement>, //Clique do mouse
    flame: number,
  ) => {
    //Salva o primeiro pixel à esquerda do elemento e seu tamanho
    const { left, width } = e.currentTarget.getBoundingClientRect();

    //Posição x do clique na tela - a posição inicial da chama para descobrir
    //onde, na chama, foi aquele clique
    const clickX = e.clientX - left;

    //Se o clique for na primeira metade da chama, reduz o valor daquela
    //chama pela metade
    if (clickX < width / 2) {
      onChange(flame - 0.5);
    } else {
      onChange(flame);
    }
  };

  return (
    //Aplica método de renderização para cada chama
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((flame) => {
        //Verifica se está cheia, vazia ou meia preenchida
        const isFull = flame <= value;
        const isHalf = flame - 0.5 === value;

        if (isFull) {
          //Se estiver cheia, renderiza ela totalmente, como se não existisse valor decimal
          return (
            <Flame
              key={flame}
              size={32}
              onClick={(e) => handleClick(e, flame)}
              className="cursor-pointer fill-red-600 text-red-600"
            />
          );
        }

        if (isHalf) {
          return (
            //Renderiza uma chama vazia
            <div key={flame} className="relative w-8 h-8 cursor-pointer">
              <Flame
                size={32}
                onClick={(e) => handleClick(e, flame)}
                className="absolute top-0 left-0 text-gray-300"
              />

              {/* Cria uma div que só renderiza metade do que tem, no caso, 
                  a parte cheia da chama*/}
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                <Flame
                  size={32}
                  onClick={(e) => handleClick(e, flame)}
                  className="fill-red-600 text-red-600"
                />
              </div>
            </div>
          );
        }

        //Se não está cheia e nem pela metade, então, está vazia
        return (
          <Flame
            key={flame}
            size={32}
            onClick={(e) => handleClick(e, flame)}
            className="cursor-pointer text-gray-300"
          />
        );
      })}
    </div>
  );
}
