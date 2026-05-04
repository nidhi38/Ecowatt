import { NotificationsCenter } from '@/components/notifications-center';

export const metadata = {
  title: 'Notifications | EcoWatt',
  description: 'View and manage your notifications',
};

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <NotificationsCenter />
      </div>
    </main>
  );
}
