import { getCurrentUser } from "@/lib/auth";
import EditableProfile from "./_components/editable-profile";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;

  return <EditableProfile user={user} />;
}
