import { EnergyAnalytics } from '@/components/energy-analytics';

export const metadata = {
  title: 'Energy Analytics | EcoWatt',
  description: 'Advanced analytics and insights into your energy trading',
};

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <EnergyAnalytics />
      </div>
    </main>
  );
}
