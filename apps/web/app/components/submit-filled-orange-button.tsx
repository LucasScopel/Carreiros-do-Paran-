interface SubmitFilledOrangeButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export default function SubmitFilledOrangeButton({
  onClick,
  children,
  className = "",
  type = "submit",
}: SubmitFilledOrangeButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`py-2 rounded-md mx-auto mt-auto bg-[#D99C6A] text-white font-bold w-48
                   cursor-pointer hover:bg-[#c46518] hover:brightness-120  transition-all duration-300
                   ${className}`}
    >
      {children}
    </button>
  );
}
