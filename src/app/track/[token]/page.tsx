import { resolveTrackingLink } from "@/features/tracking/server/queries";
import { TrackingView } from "@/components/tracking/tracking-view";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const info = await resolveTrackingLink(token);

  if (!info) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
        <h1 className="font-heading text-lg font-semibold">Link expired</h1>
        <p className="text-sm text-muted-foreground">
          This tracking link is no longer valid. Ask the rider to share a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <TrackingView token={token} info={info} />
    </div>
  );
}

export function generateMetadata() {
  return { title: "Live location", robots: { index: false, follow: false } };
}
