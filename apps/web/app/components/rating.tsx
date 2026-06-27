import { Flame, Star } from "lucide-react";

export default function Rating({
  label,
  rating,
  icon,
  tooltip = "none",
}: {
  label: string;
  rating: number;
  icon: "star" | "flame";
  tooltip?: "none" | "left" | "right";
}) {
  const normalRating = Math.max(Math.min(rating, 5), 0);

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">{label}</p>

      <div className="relative group">
        <div className="flex gap-1 stroke-zinc-800">
          {Array.from({ length: 5 }).map((_, i) =>
            icon === "star" ? (
              <Star key={i} stroke="current" strokeWidth={1} />
            ) : (
              <Flame key={i} stroke="current" strokeWidth={1} />
            ),
          )}
        </div>
        <div className="flex gap-1 absolute top-0 stroke-zinc-800 fill-yellow-300">
          {Array.from({ length: Math.floor(normalRating) }).map((_, i) =>
            icon === "star" ? (
              <Star
                key={i}
                strokeWidth={1}
                className="fill-yellow-300 stroke-zinc-800"
              />
            ) : (
              <Flame
                key={i}
                strokeWidth={1}
                className="fill-red-600 stroke-zinc-800"
              />
            ),
          )}
          {normalRating > Math.floor(normalRating) && (
            <span className="w-6 max-w-6">
              <div
                style={{
                  width: `${100 * (normalRating - Math.floor(normalRating))}%`,
                }}
                className="overflow-hidden"
              >
                {icon === "star" ? (
                  <Star
                    strokeWidth={1}
                    className="fill-yellow-300 stroke-zinc-800"
                  />
                ) : (
                  <Flame
                    strokeWidth={1}
                    className="w-6 h-6 fill-red-600 stroke-zinc-800"
                  />
                )}
              </div>
            </span>
          )}
        </div>

        {tooltip !== "none" && (
          <div
            className={`
              absolute top-1/2
              -translate-y-1/2

              whitespace-nowrap
              rounded-md
              bg-black/70
              px-2 py-1

              text-sm text-white

              opacity-0
              pointer-events-none
              transition-all

              group-hover:opacity-100

              ${tooltip === "right" ? "left-0 translate-x-34 group-hover:translate-x-36" : "right-0 -translate-x-34 group-hover:-translate-x-36"}
            `}
          >
            {normalRating.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
