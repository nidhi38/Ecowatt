import { SettingsTokenPage } from '@/components/settings-token-page';

export const metadata = {
  title: 'Settings & Tokens | EcoWatt',
  description: 'Manage your profile, role, and EWT tokens',
};

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <SettingsTokenPage />
      </div>
    </main>
  );
}
