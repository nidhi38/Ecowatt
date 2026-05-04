'use client';

import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Wallet, Activity, Send, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { getOrCreateUser, getUserOrders, getPriceHistory, getLeaderboard } from '@/lib/db-helpers';
import type { User, Order } from '@/lib/supabase';
import Link from 'next/link';
import { WalletCreditModal } from './wallet-credit-modal';

export function EnhancedDashboard() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Only render after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getOrCreateUser(address);
        setUser(userData);

        if (userData) {
          const [ordersData, pricesData, leaderboardData] = await Promise.all([
            getUserOrders(userData.id),
            getPriceHistory(30),
            getLeaderboard(5),
          ]);

          setOrders(ordersData);
          setPriceHistory(pricesData);
          setLeaderboard(leaderboardData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [mounted, isConnected, address]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center border-secondary/30 bg-card/95">
          <div className="mb-6">
            <Wallet className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">EcoWatt</h1>
            <p className="text-muted-foreground">Decentralized Energy Trading Platform</p>
          </div>
          <Button
            onClick={() => connect({ connector: injected() })}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
          >
            Connect Wallet
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Connect your MetaMask wallet to get started
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            {address && `${address.slice(0, 6)}...${address.slice(-4)}`}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => disconnect()}
          className="border-secondary/50 hover:bg-secondary/20"
        >
          Disconnect
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-secondary/30 bg-gradient-to-br from-card to-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Available Balance</p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {user?.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })} kWh
                  </p>
                </div>
                <Wallet className="w-12 h-12 text-primary/30" />
              </div>
              {user && (
                <WalletCreditModal 
                  userId={user.id} 
                  currentBalance={user.balance} 
                  onBalanceUpdate={(newBalance) => setUser({ ...user, balance: newBalance })}
                />
              )}
            </Card>

            <Card className="p-6 border-secondary/30 bg-gradient-to-br from-card to-accent/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Traded</p>
                  <p className="text-3xl font-bold text-accent mt-2">
                    {user?.total_traded.toFixed(2)} kWh
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-accent/30" />
              </div>
            </Card>

            <Card className="p-6 border-secondary/30 bg-gradient-to-br from-card to-secondary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Active Orders</p>
                  <p className="text-3xl font-bold text-secondary mt-2">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
                <Activity className="w-12 h-12 text-secondary/30" />
              </div>
            </Card>
          </div>

          {/* Price Chart */}
          <Card className="p-6 border-secondary/30 bg-card/95">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Energy Price Trend
            </h2>
            {priceHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a8d8d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#a8d8d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="timestamp" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#a8d8d8"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No price data available yet
              </div>
            )}
          </Card>

          {/* Recent Orders */}
          <Card className="p-6 border-secondary/30 bg-card/95">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Orders
            </h2>
            {orders.length > 0 ? (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 border border-secondary/20"
                  >
                    <div className="flex items-center gap-3">
                      {order.buyer_id === user?.id ? (
                        <ArrowDownLeft className="w-5 h-5 text-accent" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {order.buyer_id === user?.id ? 'Bought' : 'Sold'} {order.quantity} kWh
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {order.total_price.toFixed(4)} ETH
                      </p>
                      <p className="text-xs font-medium">
                        <span
                          className={
                            order.status === 'completed'
                              ? 'text-primary'
                              : order.status === 'pending'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            )}
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/marketplace">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6">
                <Send className="w-5 h-5 mr-2" />
                Go to Marketplace
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="w-full border-secondary/50 hover:bg-secondary/20 font-semibold py-6">
                <Activity className="w-5 h-5 mr-2" />
                View Profile
              </Button>
            </Link>
          </div>

          {/* Leaderboard Preview */}
          <Card className="p-6 border-secondary/30 bg-card/95">
            <h2 className="text-lg font-semibold text-foreground mb-4">Top Traders</h2>
            <div className="space-y-2">
              {leaderboard.map((trader, index) => (
                <div
                  key={trader.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary w-8">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-foreground">{trader.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {trader.wallet_address.slice(0, 6)}...{trader.wallet_address.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-accent">{trader.total_traded.toFixed(2)} kWh</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
