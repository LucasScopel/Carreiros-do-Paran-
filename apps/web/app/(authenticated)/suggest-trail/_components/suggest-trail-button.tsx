export default function SuggestTrailButton({
  type = "submit",
  onClick,
  children,
  className = "",
}: {
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`py-2 rounded-md mx-auto mt-auto bg-[#D99C6A] text-white font-semibold w-48 cursor-pointer hover:bg-[#c46518] hover:brightness-120 transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );
}
