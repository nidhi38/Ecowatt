import { BlockchainNetworkViz } from '@/components/blockchain-network-viz';
import { BlockchainTransactionTracker } from '@/components/blockchain-transaction-tracker';
import { BlockchainStatusPanel } from '@/components/blockchain-status-panel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'Blockchain Analytics - EcoWatt',
  description: 'Real-time blockchain network analytics and smart contract monitoring'
};

export default function BlockchainPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="outline" className="mb-4 gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-primary mb-2">Blockchain Network Analytics</h1>
            <p className="text-muted-foreground">Real-time monitoring of EcoWatt's blockchain infrastructure and smart contracts</p>
          </div>

          {/* Blockchain Status */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Network Status</h2>
            <BlockchainStatusPanel />
          </div>

          {/* Network Visualization */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Network Metrics</h2>
            <BlockchainNetworkViz />
          </div>

          {/* Transaction Tracker */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Transaction Analysis</h2>
            <BlockchainTransactionTracker />
          </div>

          {/* Smart Contract Info */}
          <Card className="p-6 border-secondary/30 bg-card mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Smart Contracts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* EcoWatt Token Contract */}
              <div className="border border-secondary/20 rounded-lg p-6 bg-secondary/5">
                <h3 className="text-lg font-semibold text-foreground mb-3">EcoWatt Token (ECOW)</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Contract:</span> <span className="font-mono text-primary">0x...ec0w</span></p>
                  <p><span className="text-muted-foreground">Type:</span> <span className="text-foreground">ERC20 Token</span></p>
                  <p><span className="text-muted-foreground">Total Supply:</span> <span className="text-primary font-semibold">1,000,000,000 ECOW</span></p>
                  <p><span className="text-muted-foreground">Circulating:</span> <span className="text-primary font-semibold">245,678,900 ECOW</span></p>
                  <p><span className="text-muted-foreground">Holders:</span> <span className="text-primary font-semibold">12,456</span></p>
                  <p><span className="text-muted-foreground">Transfers (24h):</span> <span className="text-primary font-semibold">8,234</span></p>
                </div>
              </div>

              {/* Energy Marketplace Contract */}
              <div className="border border-secondary/20 rounded-lg p-6 bg-secondary/5">
                <h3 className="text-lg font-semibold text-foreground mb-3">Energy Marketplace</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Contract:</span> <span className="font-mono text-primary">0x...mktc</span></p>
                  <p><span className="text-muted-foreground">Type:</span> <span className="text-foreground">Marketplace Smart Contract</span></p>
                  <p><span className="text-muted-foreground">Active Listings:</span> <span className="text-primary font-semibold">2,847</span></p>
                  <p><span className="text-muted-foreground">Total Transactions:</span> <span className="text-primary font-semibold">15,234</span></p>
                  <p><span className="text-muted-foreground">Volume (24h):</span> <span className="text-primary font-semibold">125,456 kWh</span></p>
                  <p><span className="text-muted-foreground">Value Locked:</span> <span className="text-primary font-semibold">$2.4M</span></p>
                </div>
              </div>
            </div>
          </Card>

          {/* Security & Compliance */}
          <Card className="p-6 border-secondary/30 bg-card">
            <h2 className="text-2xl font-bold text-foreground mb-4">Security & Compliance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-semibold text-foreground mb-3">Audit Status</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Code Audit:</span>
                    <span className="text-primary font-semibold">✓ Passed</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Security Audit:</span>
                    <span className="text-primary font-semibold">✓ Passed</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Formal Verification:</span>
                    <span className="text-primary font-semibold">✓ Passed</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-semibold text-foreground mb-3">Network Security</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Consensus Mechanism:</span>
                    <span className="text-foreground">Proof of Stake</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Network Hash:</span>
                    <span className="text-primary font-semibold">850 TH/s</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">51% Protection:</span>
                    <span className="text-primary font-semibold">$45.2B</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <h3 className="font-semibold text-foreground mb-3">Compliance</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">KYC/AML:</span>
                    <span className="text-primary font-semibold">✓ Compliant</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">GDPR:</span>
                    <span className="text-primary font-semibold">✓ Compliant</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Regulatory:</span>
                    <span className="text-primary font-semibold">✓ Approved</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
