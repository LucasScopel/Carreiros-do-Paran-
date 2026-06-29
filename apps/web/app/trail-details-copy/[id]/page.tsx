import PageScript from "./components/page-script";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrailDetails({ params }: PageProps) {
  return (
    <main className="w-full bg-orange-50">
      <PageScript params={params} />
    </main>
  );
}
