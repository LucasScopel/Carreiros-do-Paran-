export default function SuggestTrailInput({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  required = false,
}: {
  type?: "text" | "number";
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="px-4 py-2 border-2 rounded-md text-black border-[#424242] bg-gray-100 focus:border-[#D99C6A] focus:outline-none hover:border-[#D99C6A] transition-colors duration-300 "
    />
  );
}
