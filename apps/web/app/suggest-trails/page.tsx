import SuggestTrailForm from "./_components/suggest-trail-form";

export default function SuggestTrailsPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 px-4 py-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <SuggestTrailForm />
      </div>
    </div>
  );
}
