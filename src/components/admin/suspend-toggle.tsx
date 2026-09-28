import { reactivateUserAction, suspendUserAction } from "@/features/admin/server/actions";
import { ActionButton } from "@/components/shared/action-button";

export function SuspendToggle({ userId, username, isActive }: { userId: string; username: string; isActive: boolean }) {
  return isActive ? (
    <ActionButton
      action={suspendUserAction.bind(null, userId)}
      label="Suspend"
      pendingLabel="Suspending…"
      variant="destructive"
      confirmMessage={`Suspend @${username}? They'll be signed out everywhere and their live tracking links will stop.`}
    />
  ) : (
    <ActionButton
      action={reactivateUserAction.bind(null, userId)}
      label="Reactivate"
      pendingLabel="Reactivating…"
      confirmMessage={`Reactivate @${username}?`}
    />
  );
}
