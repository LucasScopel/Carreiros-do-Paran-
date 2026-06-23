import { api } from "@/lib/api/server";
import EditTrailForm from "../_components/edit-trail-form";
import { notFound } from "next/navigation";

interface EditTrailPageProps {
  params: Promise<{
    trailId: string;
  }>;
}

export default async function EditTrailPage({ params }: EditTrailPageProps) {
  const { trailId } = await params;

  const trail = await api.trails.get(trailId);

  if (!trail.ok) {
    notFound();
  }

  return <EditTrailForm initial={trail.data} />;
}
