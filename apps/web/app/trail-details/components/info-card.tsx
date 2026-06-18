interface InfoCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  badge?: string;
}

export default function InfoCard({
  title,
  value,
  icon,
  badge,
}: InfoCardProps) {
  return (
    <div className="rounded-xl border-2 border-[#D99C6A] bg-gray-100 p-5 shadow-sm">
      {badge && (
        <span className="inline-block rounded-full bg-red-500 px-4 py-1 text-sm text-white">
          {badge}
        </span>
      )}

      <div className="mt-2 flex items-center gap-1 text-2xl font-semibold text-[#263327]">
        {icon}
        <span>{title}</span>
      </div>

      <p className="mt-3 ml-0.5 text-lg ">
        {value}
      </p>
    </div>
  );
}