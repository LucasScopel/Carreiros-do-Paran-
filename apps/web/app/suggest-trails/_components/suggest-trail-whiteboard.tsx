export default function SuggestTrailWhiteboard({
  children,
  onSubmit,
}: {
  children?: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full h-full px-6 py-6 bg-white rounded-md flex flex-col"
    >
      {children}
    </form>
  );
}
