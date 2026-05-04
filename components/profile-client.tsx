'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LeaderboardEntry {
  rank: number;
  address: string;
  energySold: number;
  energyBought: number;
  totalTransactions: number;
  score: number;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, address: '0xABCD...EF01', energySold: 1250, energyBought: 800, totalTransactions: 45, score: 2050 },
  { rank: 2, address: '0x1234...5678', energySold: 980, energyBought: 650, totalTransactions: 38, score: 1630 },
  { rank: 3, address: '0x9876...5432', energySold: 750, energyBought: 920, totalTransactions: 52, score: 1670 },
  { rank: 4, address: '0xFEDC...BA98', energySold: 640, energyBought: 780, totalTransactions: 35, score: 1420 },
  { rank: 5, address: '0x4567...8901', energySold: 520, energyBought: 600, totalTransactions: 28, score: 1120 },
];

export function ProfileClient() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isConnected) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/">
            <Button variant="outline" className="mb-8">← Back to Dashboard</Button>
          </Link>
          <Card className="p-12 bg-card text-center border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-8">You need to connect your wallet to view your profile</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">Return to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const currentUserRank = mockLeaderboard.find(entry => entry.address.includes('1234'));

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-4">← Back to Dashboard</Button>
          </Link>
          <h1 className="text-4xl font-bold text-primary">Your Profile</h1>
          <p className="text-muted-foreground mt-2">Trading statistics and leaderboard ranking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Stats */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6">Your Stats</h2>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded text-foreground">
                    {address?.slice(0, 10)}...{address?.slice(-8)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Leaderboard Rank</p>
                  <p className="text-3xl font-bold text-primary">{currentUserRank?.rank || '—'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Your Score</p>
                  <p className="text-2xl font-bold text-secondary">{currentUserRank?.score || 0}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Energy Sold</p>
                    <p className="text-lg font-semibold text-foreground">{currentUserRank?.energySold || 0} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Energy Bought</p>
                    <p className="text-lg font-semibold text-foreground">{currentUserRank?.energyBought || 0} units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                    <p className="text-lg font-semibold text-foreground">{currentUserRank?.totalTransactions || 0}</p>
                  </div>
                </div>
              </div>

              <Link href="/marketplace" className="block mt-6">
                <Button className="w-full bg-primary hover:bg-primary/90">Go to Marketplace</Button>
              </Link>
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Global Leaderboard</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-sm font-semibold text-foreground">Rank</th>
                      <th className="text-left py-3 px-3 text-sm font-semibold text-foreground">Address</th>
                      <th className="text-right py-3 px-3 text-sm font-semibold text-foreground">Sold</th>
                      <th className="text-right py-3 px-3 text-sm font-semibold text-foreground">Bought</th>
                      <th className="text-right py-3 px-3 text-sm font-semibold text-foreground">Txns</th>
                      <th className="text-right py-3 px-3 text-sm font-semibold text-foreground">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockLeaderboard.map((entry, idx) => (
                      <tr 
                        key={idx} 
                        className={`border-b border-border hover:bg-muted/50 transition-colors ${
                          entry.address.includes('1234') ? 'bg-muted' : ''
                        }`}
                      >
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                              entry.rank === 1 ? 'bg-yellow-400' :
                              entry.rank === 2 ? 'bg-gray-300' :
                              entry.rank === 3 ? 'bg-orange-400' :
                              'bg-primary'
                            }`}>
                              {entry.rank}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 font-mono text-sm text-foreground">{entry.address}</td>
                        <td className="py-4 px-3 text-right text-foreground font-semibold">{entry.energySold}</td>
                        <td className="py-4 px-3 text-right text-foreground font-semibold">{entry.energyBought}</td>
                        <td className="py-4 px-3 text-right text-foreground font-semibold">{entry.totalTransactions}</td>
                        <td className="py-4 px-3 text-right text-primary font-bold">{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <Card className="p-6 bg-card border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Transactions</h2>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">Energy Transaction #{i}</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">+{50 * i} ECOW</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
