import { createClubAction } from "@/features/clubs/server/actions";
import { ClubForm } from "@/components/clubs/club-form";
import { Card, CardContent } from "@/components/ui/card";

export default function NewClubPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Start a club</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ll get an invite link to share with your members right after.
        </p>
      </div>
      <Card>
        <CardContent>
          <ClubForm action={createClubAction} submitLabel="Create club" />
        </CardContent>
      </Card>
    </div>
  );
}
