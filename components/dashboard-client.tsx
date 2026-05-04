'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function DashboardClient() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">EcoWatt</h1>
            <p className="text-muted-foreground">Decentralized Energy Trading Platform</p>
          </div>
          <div className="flex gap-3">
            {isConnected ? (
              <>
                <Button variant="outline" disabled>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                className="bg-primary hover:bg-primary/90"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>

        {isConnected ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 bg-card border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Energy Balance</h3>
                <p className="text-3xl font-bold text-primary">0.00 ECOW</p>
                <p className="text-xs text-muted-foreground mt-2">Ethereum Sepolia Testnet</p>
              </Card>

              <Card className="p-6 bg-card border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Energy Sold</h3>
                <p className="text-3xl font-bold text-secondary">0 units</p>
                <p className="text-xs text-muted-foreground mt-2">Total lifetime sales</p>
              </Card>

              <Card className="p-6 bg-card border border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Energy Bought</h3>
                <p className="text-3xl font-bold text-accent">0 units</p>
                <p className="text-xs text-muted-foreground mt-2">Total lifetime purchases</p>
              </Card>
            </div>

            {/* Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/marketplace">
                <Card className="p-8 bg-card hover:shadow-lg transition-shadow cursor-pointer border border-border">
                  <h2 className="text-2xl font-bold text-primary mb-2">Energy Marketplace</h2>
                  <p className="text-muted-foreground mb-4">Buy and sell energy on the decentralized marketplace</p>
                  <Button className="w-full bg-primary hover:bg-primary/90">Browse Marketplace</Button>
                </Card>
              </Link>

              <Link href="/profile">
                <Card className="p-8 bg-card hover:shadow-lg transition-shadow cursor-pointer border border-border">
                  <h2 className="text-2xl font-bold text-secondary mb-2">Your Profile</h2>
                  <p className="text-muted-foreground mb-4">View your trading history and leaderboard rank</p>
                  <Button variant="outline" className="w-full">View Profile</Button>
                </Card>
              </Link>
            </div>

            {/* Features */}
            <div className="mt-12 bg-card p-8 rounded-lg border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold mb-4">1</div>
                  <h3 className="font-semibold text-foreground mb-2">Register</h3>
                  <p className="text-sm text-muted-foreground">Create an account and connect your Ethereum wallet</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center text-white font-bold mb-4">2</div>
                  <h3 className="font-semibold text-foreground mb-2">List Energy</h3>
                  <p className="text-sm text-muted-foreground">List your surplus energy on the marketplace</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-white font-bold mb-4">3</div>
                  <h3 className="font-semibold text-foreground mb-2">Trade & Earn</h3>
                  <p className="text-sm text-muted-foreground">Trade energy tokens and earn rewards</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Card className="p-12 bg-card text-center border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Welcome to EcoWatt</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Connect your Ethereum wallet to start trading energy on the decentralized marketplace. Supported on Ethereum Sepolia Testnet.
            </p>
            <Button 
              onClick={() => connectors[0] && connect({ connector: connectors[0] })}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6"
            >
              Connect Wallet to Begin
            </Button>
            <p className="text-xs text-muted-foreground mt-6">
              Don&apos;t have a wallet? <a href="https://metamask.io" className="text-primary underline">Download MetaMask</a>
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
