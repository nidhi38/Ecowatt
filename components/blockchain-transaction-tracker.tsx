'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, Clock, AlertCircle, ArrowRight, Zap } from 'lucide-react';

interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: Date;
  type: 'buy' | 'sell' | 'mint' | 'burn';
}

interface BlockchainMetrics {
  totalTransactions: number;
  pendingTransactions: number;
  confirmedTransactions: number;
  failedTransactions: number;
  averageGasPrice: number;
  networkLatency: number;
}

export function BlockchainTransactionTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<BlockchainMetrics>({
    totalTransactions: 0,
    pendingTransactions: 0,
    confirmedTransactions: 0,
    failedTransactions: 0,
    averageGasPrice: 0,
    networkLatency: 0,
  });
  const [gasHistory, setGasHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Mock transaction data
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        hash: '0x' + Math.random().toString(16).slice(2),
        from: '0x1234...5678',
        to: '0x8765...4321',
        value: '100',
        gasUsed: '21000',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 5 * 60000),
        type: 'buy',
      },
      {
        id: '2',
        hash: '0x' + Math.random().toString(16).slice(2),
        from: '0x2222...3333',
        to: '0x4444...5555',
        value: '250',
        gasUsed: '45000',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 15 * 60000),
        type: 'sell',
      },
      {
        id: '3',
        hash: '0x' + Math.random().toString(16).slice(2),
        from: '0x6666...7777',
        to: '0x8888...9999',
        value: '50',
        gasUsed: '21000',
        status: 'pending',
        timestamp: new Date(Date.now() - 2 * 60000),
        type: 'buy',
      },
    ];

    const mockGasHistory = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      gasPrice: Math.random() * 100 + 20,
      transactions: Math.floor(Math.random() * 1000) + 100,
    }));

    setTransactions(mockTransactions);
    setMetrics({
      totalTransactions: 15234,
      pendingTransactions: 45,
      confirmedTransactions: 15189,
      failedTransactions: 0,
      averageGasPrice: 45.5,
      networkLatency: 2.3,
    });
    setGasHistory(mockGasHistory);
  }, [mounted]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary/20 text-primary';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-600';
      case 'failed':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-secondary/30 bg-card">
          <p className="text-xs text-muted-foreground mb-2">Total Transactions</p>
          <p className="text-2xl font-bold text-primary">{metrics.totalTransactions.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Confirmed: {metrics.confirmedTransactions}</p>
        </Card>
        <Card className="p-4 border-secondary/30 bg-card">
          <p className="text-xs text-muted-foreground mb-2">Pending Transactions</p>
          <p className="text-2xl font-bold text-yellow-600">{metrics.pendingTransactions}</p>
          <p className="text-xs text-muted-foreground mt-2">Avg Gas: {metrics.averageGasPrice.toFixed(2)} Gwei</p>
        </Card>
        <Card className="p-4 border-secondary/30 bg-card">
          <p className="text-xs text-muted-foreground mb-2">Network Health</p>
          <p className="text-2xl font-bold text-primary">{(100 - (metrics.failedTransactions / metrics.totalTransactions) * 100).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-2">Latency: {metrics.networkLatency.toFixed(1)}ms</p>
        </Card>
      </div>

      {/* Gas Price Chart */}
      <Card className="p-6 border-secondary/30 bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Gas Price Trend (24h)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={gasHistory}>
            <defs>
              <linearGradient id="colorGasPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="time" stroke="rgba(0,0,0,0.5)" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(0,0,0,0.5)" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="gasPrice" 
              stroke="#a78bfa" 
              fillOpacity={1} 
              fill="url(#colorGasPrice)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6 border-secondary/30 bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-lg border border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-2 rounded-lg ${getStatusColor(tx.status)} bg-opacity-20`}>
                  {getStatusIcon(tx.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm capitalize">{tx.type}</p>
                    <Badge className={getStatusColor(tx.status)}>
                      {tx.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tx.from} <ArrowRight className="inline w-3 h-3" /> {tx.to}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hash: {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{tx.value} kWh</p>
                <p className="text-xs text-muted-foreground">Gas: {parseInt(tx.gasUsed).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Blockchain Network Stats */}
      <Card className="p-6 border-secondary/30 bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Blockchain Network Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Confirmed (24h)</p>
            <p className="text-xl font-bold text-primary">{(metrics.confirmedTransactions / 100).toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-muted-foreground mb-1">Pending (24h)</p>
            <p className="text-xl font-bold text-yellow-600">{metrics.pendingTransactions}</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Avg Block Time</p>
            <p className="text-xl font-bold text-primary">12s</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Network Load</p>
            <p className="text-xl font-bold text-primary">42%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
