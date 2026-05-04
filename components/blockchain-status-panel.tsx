'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface BlockchainStatus {
  networkStatus: 'connected' | 'disconnected' | 'error';
  gasPrice: number;
  blockNumber: number;
  txSpeed: number;
  lastUpdated: Date;
}

export function BlockchainStatusPanel() {
  const [status, setStatus] = useState<BlockchainStatus>({
    networkStatus: 'connected',
    gasPrice: 45.5,
    blockNumber: 19823456,
    txSpeed: 12,
    lastUpdated: new Date(),
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const updateStatus = async () => {
      try {
        // Simulate fetching from blockchain (in production, use ethers.js or web3.js)
        const newStatus: BlockchainStatus = {
          networkStatus: 'connected',
          gasPrice: Math.random() * 100 + 20,
          blockNumber: Math.floor(Math.random() * 100000) + 19800000,
          txSpeed: Math.floor(Math.random() * 30) + 5,
          lastUpdated: new Date(),
        };
        setStatus(newStatus);
      } catch (error) {
        console.error('Error updating blockchain status:', error);
        setStatus(prev => ({ ...prev, networkStatus: 'error' }));
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  if (!mounted) {
    return (
      <Card className="bg-gradient-to-r from-secondary/10 to-primary/5 border-secondary/20 p-4">
        <div className="text-xs text-muted-foreground">Blockchain Status</div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-secondary/10 to-primary/5 border-secondary/20 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Network Status */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Network Status</span>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(status.networkStatus)}>
                {getStatusIcon(status.networkStatus)}
                <span className="ml-1 capitalize">{status.networkStatus}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Gas Price */}
        <div className="flex flex-col gap-1 border-l border-r border-secondary/20 px-4">
          <span className="text-xs text-muted-foreground">Gas Price</span>
          <p className="font-semibold text-foreground">{status.gasPrice.toFixed(2)} Gwei</p>
        </div>

        {/* Block Number */}
        <div className="flex flex-col gap-1 border-r border-secondary/20 pr-4">
          <span className="text-xs text-muted-foreground">Block</span>
          <p className="font-semibold text-foreground">{status.blockNumber.toLocaleString()}</p>
        </div>

        {/* TX Speed */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Avg TX Time</span>
          <p className="font-semibold text-foreground">{status.txSpeed}s</p>
        </div>

        {/* Updated */}
        <div className="flex flex-col gap-1 text-right">
          <span className="text-xs text-muted-foreground">Updated</span>
          <p className="text-xs font-mono text-muted-foreground">
            {status.lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Card>
  );
}
