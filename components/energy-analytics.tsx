'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getOrCreateUser, getPriceHistory, getTokenTransactionHistory } from '@/lib/db-helpers';
import { TrendingUp, TrendingDown, Zap, Award } from 'lucide-react';

export function EnergyAnalytics() {
  const { address } = useAccount();
  const [user, setUser] = useState<any>(null);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [tokenData, setTokenData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !address) return;

    const fetchAnalytics = async () => {
      try {
        const userData = await getOrCreateUser(address);
        setUser(userData);

        if (userData) {
          const prices = await getPriceHistory(90);
          setPriceData(prices);

          const tokens = await getTokenTransactionHistory(userData.id, 100);
          setTokenData(tokens);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [mounted, address]);

  if (!mounted) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  const filteredPriceData = priceData.slice(
    Math.max(0, priceData.length - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90))
  );

  const avgPrice = priceData.length > 0 
    ? priceData.reduce((sum, p) => sum + p.price, 0) / priceData.length 
    : 0;

  const maxPrice = Math.max(...priceData.map(p => p.price), 0);
  const minPrice = Math.min(...priceData.map(p => p.price), Infinity);

  const tokenGains = tokenData.filter(t => t.transaction_type === 'earn').length;
  const totalEarned = tokenData
    .filter(t => t.transaction_type === 'earn')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Energy Analytics</h2>
          <p className="text-muted-foreground">Detailed insights into your energy trading performance</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className="text-sm"
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-secondary/30 bg-gradient-to-br from-background to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Average Price</p>
              <p className="text-2xl font-bold text-primary">${avgPrice.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Zap className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-secondary/30 bg-gradient-to-br from-background to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Max Price</p>
              <p className="text-2xl font-bold text-green-600">${maxPrice.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-secondary/30 bg-gradient-to-br from-background to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Min Price</p>
              <p className="text-2xl font-bold text-red-600">${minPrice.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-secondary/30 bg-gradient-to-br from-background to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tokens Earned</p>
              <p className="text-2xl font-bold text-accent">{totalEarned.toFixed(2)} EWT</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <Award className="w-6 h-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Card className="p-6 border-secondary/30">
        <h3 className="text-lg font-semibold text-foreground mb-4">Energy Price Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredPriceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="rgba(0,0,0,0.5)"
              tick={{ fontSize: 12 }}
            />
            <YAxis yAxisId="left" stroke="rgba(0,0,0,0.5)" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(0,0,0,0.5)" tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#a78bfa" 
              strokeWidth={2}
              dot={false}
              yAxisId="left"
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="volume" 
              stroke="#86efac" 
              strokeWidth={2}
              dot={false}
              yAxisId="right"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Token Earnings Chart */}
      <Card className="p-6 border-secondary/30">
        <h3 className="text-lg font-semibold text-foreground mb-4">Token Earnings Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg border border-secondary/20">
              <span className="text-muted-foreground">Total Earnings</span>
              <span className="font-bold text-accent">{totalEarned.toFixed(2)} EWT</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg border border-secondary/20">
              <span className="text-muted-foreground">Earnings Count</span>
              <span className="font-bold text-primary">{tokenGains}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg border border-secondary/20">
              <span className="text-muted-foreground">Average per Trade</span>
              <span className="font-bold text-primary">
                {tokenGains > 0 ? (totalEarned / tokenGains).toFixed(2) : '0.00'} EWT
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'Earned', value: tokenGains },
              { name: 'Traded', value: tokenData.filter(t => t.transaction_type === 'spend').length }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
              <XAxis dataKey="name" stroke="rgba(0,0,0,0.5)" />
              <YAxis stroke="rgba(0,0,0,0.5)" />
              <Tooltip />
              <Bar dataKey="value" fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Analytics Insights */}
      <Card className="p-6 border-secondary/30 bg-gradient-to-r from-secondary/10 to-accent/5">
        <h3 className="font-semibold text-foreground mb-4">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded mt-1">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Price Volatility</p>
              <p className="text-sm text-muted-foreground">
                Energy prices range from ${minPrice.toFixed(2)} to ${maxPrice.toFixed(2)}, 
                with an average of ${avgPrice.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/10 rounded mt-1">
              <Award className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Token Rewards</p>
              <p className="text-sm text-muted-foreground">
                You've earned {totalEarned.toFixed(2)} EWT tokens through {tokenGains} successful trades
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
