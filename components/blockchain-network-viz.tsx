'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Network, GitBranch, Shield, Zap } from 'lucide-react';

interface BlockData {
  blockNumber: number;
  timestamp: string;
  transactions: number;
  gasUsed: number;
  gasLimit: number;
  minerReward: number;
}

export function BlockchainNetworkViz() {
  const [blockData, setBlockData] = useState<BlockData[]>([]);
  const [nodeStats, setNodeStats] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Mock block data
    const mockBlockData = Array.from({ length: 20 }, (_, i) => ({
      blockNumber: 19823500 - i,
      timestamp: `Block ${19823500 - i}`,
      transactions: Math.floor(Math.random() * 300) + 50,
      gasUsed: Math.floor(Math.random() * 15000000) + 5000000,
      gasLimit: 30000000,
      minerReward: 2.5 + (Math.random() * 0.5),
    })).reverse();

    const mockNodeStats = [
      { name: 'Full Nodes', value: 7250, color: '#a78bfa' },
      { name: 'Archive Nodes', value: 1842, color: '#86efac' },
      { name: 'Light Nodes', value: 24500, color: '#fbbf24' },
      { name: 'Validator Nodes', value: 568, color: '#f87171' },
    ];

    setBlockData(mockBlockData);
    setNodeStats(mockNodeStats);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="w-full space-y-6">
      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-secondary/30 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Nodes</p>
              <p className="text-2xl font-bold text-primary">34,160</p>
              <p className="text-xs text-primary mt-2">+2.4% this week</p>
            </div>
            <Network className="w-8 h-8 text-primary/30" />
          </div>
        </Card>

        <Card className="p-4 border-secondary/30 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Chain Height</p>
              <p className="text-2xl font-bold text-primary">19,823,501</p>
              <p className="text-xs text-primary mt-2">Last: 2 secs ago</p>
            </div>
            <GitBranch className="w-8 h-8 text-primary/30" />
          </div>
        </Card>

        <Card className="p-4 border-secondary/30 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Active Validators</p>
              <p className="text-2xl font-bold text-primary">568</p>
              <p className="text-xs text-primary mt-2">95.2% healthy</p>
            </div>
            <Shield className="w-8 h-8 text-primary/30" />
          </div>
        </Card>

        <Card className="p-4 border-secondary/30 bg-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Network TPS</p>
              <p className="text-2xl font-bold text-primary">487</p>
              <p className="text-xs text-primary mt-2">Max: 1,200</p>
            </div>
            <Zap className="w-8 h-8 text-primary/30" />
          </div>
        </Card>
      </div>

      {/* Block Production Rate */}
      <Card className="p-6 border-secondary/30 bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Block Production Rate</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={blockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="rgba(0,0,0,0.5)"
              tick={{ fontSize: 10 }}
              interval={4}
            />
            <YAxis stroke="rgba(0,0,0,0.5)" yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis stroke="rgba(0,0,0,0.5)" yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="transactions" 
              stroke="#a78bfa" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Transactions"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="gasUsed" 
              stroke="#86efac" 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Gas Used"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Gas Usage vs Limit */}
      <Card className="p-6 border-secondary/30 bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Gas Usage vs Limit</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={blockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis 
              dataKey="blockNumber" 
              stroke="rgba(0,0,0,0.5)"
              tick={{ fontSize: 10 }}
              interval={4}
            />
            <YAxis stroke="rgba(0,0,0,0.5)" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="gasUsed" fill="#a78bfa" name="Gas Used" isAnimationActive={false} />
            <Bar dataKey="gasLimit" fill="#e5e7eb" name="Gas Limit" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Node Distribution */}
      <Card className="p-6 border-secondary/30 bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Blockchain Node Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Node Types */}
          <div className="space-y-4">
            {nodeStats.map((node, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-secondary/20 bg-secondary/5">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: node.color }}
                  />
                  <div>
                    <p className="font-medium text-foreground text-sm">{node.name}</p>
                    <p className="text-xs text-muted-foreground">{node.value.toLocaleString()} nodes</p>
                  </div>
                </div>
                <p className="font-bold text-foreground">
                  {((node.value / 34160) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>

          {/* Network Health */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">Network Consensus</p>
              <div className="w-full bg-secondary rounded-full h-2 mb-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '99.2%' }}></div>
              </div>
              <p className="text-sm font-medium text-foreground">99.2% Agreement</p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">Validator Participation</p>
              <div className="w-full bg-secondary rounded-full h-2 mb-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '95.2%' }}></div>
              </div>
              <p className="text-sm font-medium text-foreground">95.2% Active</p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-2">Block Finality</p>
              <div className="w-full bg-secondary rounded-full h-2 mb-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-sm font-medium text-foreground">100% Finalized</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Smart Contract Metrics */}
      <Card className="p-6 border-secondary/30 bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Smart Contract Activity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
            <p className="text-xs text-muted-foreground mb-2">Deployed Contracts</p>
            <p className="text-2xl font-bold text-primary">2,847</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
            <p className="text-xs text-muted-foreground mb-2">Active Contracts</p>
            <p className="text-2xl font-bold text-primary">892</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
            <p className="text-xs text-muted-foreground mb-2">Contract Calls/Day</p>
            <p className="text-2xl font-bold text-primary">124K</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
            <p className="text-xs text-muted-foreground mb-2">Total Value Locked</p>
            <p className="text-2xl font-bold text-primary">$2.4B</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
