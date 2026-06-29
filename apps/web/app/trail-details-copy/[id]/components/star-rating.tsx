import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  //Verifica se clicou na direita ou na esquerda da estrela
  const handleClick = (
    e: React.MouseEvent<SVGSVGElement>, //Clique do mouse
    star: number,
  ) => {
    //Salva o primeiro pixel à esquerda do elemento e seu tamanho
    const { left, width } = e.currentTarget.getBoundingClientRect();

    //Posição x do clique na tela - a posição inicial da estrela para descobrir
    //onde, na estrela, foi aquele clique
    const clickX = e.clientX - left;

    //Se o clique for na primeira metade da estrela, reduz o valor daquela
    //estrela pela metade
    if (clickX < width / 2) {
      onChange(star - 0.5);
    } else {
      onChange(star);
    }
  };

  return (
    //Aplica método de renderização para cada estrela
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        //Verifica se está cheia, vazia ou meia preenchida
        const isFull = star <= value;
        const isHalf = star - 0.5 === value;

        if (isFull) {
          //Se estiver cheia, renderiza ela totalmente, como se não existisse valor decimal
          return (
            <Star
              key={star}
              size={32}
              onClick={(e) => handleClick(e, star)}
              className="cursor-pointer fill-yellow-400 text-yellow-400"
            />
          );
        }

        if (isHalf) {
          return (
            //Renderiza uma estrela vazia
            <div key={star} className="relative w-8 h-8 cursor-pointer">
              <Star
                size={32}
                onClick={(e) => handleClick(e, star)}
                className="absolute top-0 left-0 text-gray-300"
              />

              {/* Cria uma div que só renderiza metade do que tem, no caso, 
                  a parte cheia da estrela*/}
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                <Star
                  size={32}
                  onClick={(e) => handleClick(e, star)}
                  className="fill-yellow-400 text-yellow-400"
                />
              </div>
            </div>
          );
        }

        //Se não está cheia e nem pela metade, então, está vazia
        return (
          <Star
            key={star}
            size={32}
            onClick={(e) => handleClick(e, star)}
            className="cursor-pointer text-gray-300"
          />
        );
      })}
    </div>
  );
}
