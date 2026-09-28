import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

// Ride groups live inside their ride's room (chat, live map, members), so this
// route just forwards there. Standing crews are clubs — see /clubs.
export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const group = await prisma.rideGroup.findUnique({ where: { id: groupId }, select: { rideId: true } });
  if (!group) notFound();
  redirect(`/rides/${group.rideId}`);
}
