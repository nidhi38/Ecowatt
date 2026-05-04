'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getOrCreateUser, getTransactionAuditLogs } from '@/lib/db-helpers';
import { Eye, Download, Filter } from 'lucide-react';

interface TransactionRecord {
  id: string;
  buyer_id: string;
  seller_id: string;
  action: string;
  amount: number;
  status: string;
  tx_hash: string;
  timestamp: string;
  buyer?: { username: string };
  seller?: { username: string };
}

export function TransactionHistory() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !address) return;

    const fetchTransactions = async () => {
      try {
        const userData = await getOrCreateUser(address);
        setUser(userData);

        if (userData) {
          const txLogs = await getTransactionAuditLogs(userData.id, 100);
          setTransactions(txLogs);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [mounted, address]);

  if (!mounted) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.action === filter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Status', 'TX Hash'];
    const rows = filteredTransactions.map(tx => [
      formatDate(tx.timestamp),
      tx.action,
      tx.amount.toFixed(2),
      tx.status,
      tx.tx_hash || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', 'transactions.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Transaction History</h2>
          <p className="text-muted-foreground">Complete audit trail of all your trades</p>
        </div>
        <Button onClick={downloadCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex gap-2">
        {(['all', 'buy', 'sell'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden border-secondary/30">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/10">
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>TX Hash</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map(tx => (
                  <TableRow key={tx.id} className="border-secondary/20 hover:bg-secondary/5">
                    <TableCell className="font-medium text-foreground">
                      {formatDate(tx.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase text-xs">
                        {tx.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {tx.amount.toFixed(2)} EWT
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(tx.status)}>
                        {tx.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {tx.tx_hash ? `${tx.tx_hash.slice(0, 8)}...` : 'Pending'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          if (tx.tx_hash) {
                            window.open(`https://etherscan.io/tx/${tx.tx_hash}`, '_blank');
                          }
                        }}
                        disabled={!tx.tx_hash}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="bg-gradient-to-r from-secondary/10 to-accent/5 p-6 border-secondary/20">
        <h3 className="font-semibold text-foreground mb-3">Transaction Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold text-primary">{filteredTransactions.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredTransactions.filter(t => t.status?.toLowerCase() === 'completed').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredTransactions.filter(t => t.status?.toLowerCase() === 'pending').length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
