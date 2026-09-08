import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  redirect(`/riders/${user.username}`);
}
