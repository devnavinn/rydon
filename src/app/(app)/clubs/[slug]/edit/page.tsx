import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { deleteClubAction, updateClubAction } from "@/features/clubs/server/actions";
import { isClubAdmin } from "@/features/clubs/permissions";
import { getClubDetail, getMembership } from "@/features/clubs/server/queries";
import { ClubForm } from "@/components/clubs/club-form";
import { ActionButton } from "@/components/shared/action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, user] = await Promise.all([params, requireUser()]);
  const club = await getClubDetail(slug);
  if (!club) notFound();
  const membership = await getMembership(club.id, user.id);
  if (!isClubAdmin(membership)) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <Link href={`/clubs/${club.slug}`} className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3.5" /> {club.name}
      </Link>
      <h1 className="font-heading text-3xl tracking-wide">Edit club</h1>
      <Card>
        <CardContent>
          <ClubForm action={updateClubAction.bind(null, club.id)} club={club} submitLabel="Save changes" />
        </CardContent>
      </Card>

      {membership?.role === "OWNER" ? (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Delete club</CardTitle>
            <CardDescription>
              Removes the club and its member list. Club rides stay on as regular rides.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActionButton
              action={deleteClubAction.bind(null, club.id)}
              label="Delete club"
              pendingLabel="Deleting…"
              variant="destructive"
              confirmMessage={`Delete ${club.name} for good? This can't be undone.`}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
