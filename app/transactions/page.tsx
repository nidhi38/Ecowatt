import { TransactionHistory } from '@/components/transaction-history';

export const metadata = {
  title: 'Transaction History | EcoWatt',
  description: 'View and manage your transaction history',
};

export default function TransactionsPage() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <TransactionHistory />
      </div>
    </main>
  );
}
