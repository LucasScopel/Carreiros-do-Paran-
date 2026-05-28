interface SubmitFilledGreenButtonProps {
  children: React.ReactNode;
}

export default function SubmitFilledGreenButton({
  children,
}: SubmitFilledGreenButtonProps) {
  return (
    <button
      type="submit"
      className="py-2 rounded-md mx-auto mt-auto bg-[#D99C6A] text-white font-bold w-48
                   cursor-pointer hover:bg-[#c46518] hover:brightness-120  transition-all duration-300"
    >
      {children}
    </button>
  );
}
