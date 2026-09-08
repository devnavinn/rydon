import { getCurrentUser } from "@/lib/auth";
import { listNotifications, getUnreadCount } from "@/features/notifications/server/queries";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [{ notifications, nextCursor }, unreadCount] = await Promise.all([
    listNotifications(user.id),
    getUnreadCount(user.id),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4">
      <div>
        <h1 className="font-heading text-3xl tracking-wide">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Ride invites, approvals, and updates from your rides.
        </p>
      </div>
      <NotificationsList initialData={{ notifications, nextCursor, unreadCount }} />
    </div>
  );
}
