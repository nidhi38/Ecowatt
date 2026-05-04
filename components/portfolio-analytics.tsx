'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Zap } from 'lucide-react';
import { getOrCreateUser, getUserOrders, getLeaderboard } from '@/lib/db-helpers';
import { getTransactionHistory } from '@/lib/transaction-handler';
import type { User, Order } from '@/lib/supabase';
import { ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

export function PortfolioAnalytics() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      if (!isConnected || !address) {
        console.log('[v0] Portfolio: Not connected or no address');
        setLoading(false);
        return;
      }

      try {
        console.log('[v0] Portfolio: Fetching data for address:', address);
        const userData = await getOrCreateUser(address);
        console.log('[v0] Portfolio: User data:', userData);
        setUser(userData);

        if (userData) {
          const [ordersData, leaderboardData, txHistory] = await Promise.all([
            getUserOrders(userData.id),
            getLeaderboard(10),
            getTransactionHistory(userData.id, 20),
          ]);

          console.log('[v0] Portfolio: Orders:', ordersData?.length || 0);
          console.log('[v0] Portfolio: Leaderboard:', leaderboardData?.length || 0);
          console.log('[v0] Portfolio: Transactions:', txHistory?.length || 0);

          setOrders(ordersData || []);
          setLeaderboard(leaderboardData || []);
          setTransactionHistory(txHistory || []);
        }
      } catch (error) {
        console.error('[v0] Portfolio: Error fetching portfolio data:', error);
        setOrders([]);
        setLeaderboard([]);
        setTransactionHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
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
        <Card className="p-8 text-center border-secondary/30 bg-card/95">
          <p className="text-muted-foreground">Connect your wallet to view portfolio</p>
        </Card>
      </div>
    );
  }

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalBought = completedOrders
    .filter((o) => o.buyer_id === user?.id)
    .reduce((sum, o) => sum + o.quantity, 0);
  const totalSold = completedOrders
    .filter((o) => o.seller_id === user?.id)
    .reduce((sum, o) => sum + o.quantity, 0);
  const totalProfit = completedOrders.reduce((sum, o) => {
    if (o.seller_id === user?.id) {
      return sum + o.total_price;
    }
    return sum - o.total_price;
  }, 0);

  const monthlyData = [
    { month: 'Jan', bought: 120, sold: 90, profit: 5.2 },
    { month: 'Feb', bought: 150, sold: 110, profit: 8.1 },
    { month: 'Mar', bought: 180, sold: 140, profit: 12.3 },
    { month: 'Apr', bought: 200, sold: 160, profit: 15.7 },
    { month: 'May', bought: 220, sold: 180, profit: 18.5 },
    { month: 'Jun', bought: 250, sold: 200, profit: 22.3 },
  ];

  const portfolioDistribution = [
    { name: 'Holdings', value: user?.balance || 0, color: '#a8d8d8' },
    { name: 'Traded', value: user?.total_traded || 1, color: '#b8e6e6' },
  ];

  const userRank = leaderboard.findIndex((u) => u.id === user?.id) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Portfolio & Analytics</h1>
          <p className="text-muted-foreground mt-2">Track your trading performance and statistics</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6 border-secondary/30 bg-gradient-to-br from-card to-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Bought</p>
                    <p className="text-2xl font-bold text-primary mt-2">{totalBought.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">kWh</p>
                  </div>
                  <Zap className="w-10 h-10 text-primary/30" />
                </div>
              </Card>

              <Card className="p-6 border-secondary/30 bg-gradient-to-br from-card to-accent/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Total Sold</p>
                    <p className="text-2xl font-bold text-accent mt-2">{totalSold.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">kWh</p>
                  </div>
                  <Zap className="w-10 h-10 text-accent/30" />
                </div>
              </Card>

              <Card className="p-6 border-secondary/30 bg-gradient-to-br from-card to-secondary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">P&L</p>
                    <p className={`text-2xl font-bold mt-2 ${totalProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>
                      {totalProfit.toFixed(4)} ETH
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Profit & Loss</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-secondary/30" />
                </div>
              </Card>

              <Card className="p-6 border-secondary/30 bg-gradient-to-br from-card to-blue-400/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Leaderboard Rank</p>
                    <p className="text-2xl font-bold text-blue-500 mt-2">#{userRank}</p>
                    <p className="text-xs text-muted-foreground mt-1">of {leaderboard.length}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-400/30" />
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Performance */}
              <Card className="p-6 border-secondary/30 bg-card/95">
                <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                    <Legend />
                    <Bar dataKey="bought" fill="#a8d8d8" name="Bought (kWh)" />
                    <Bar dataKey="sold" fill="#f4a8b8" name="Sold (kWh)" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* Profit Trend */}
              <Card className="p-6 border-secondary/30 bg-card/95">
                <h2 className="text-lg font-semibold text-foreground mb-4">Profit Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#a8d8d8"
                      name="Profit (ETH)"
                      strokeWidth={2}
                      dot={{ fill: '#a8d8d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="p-6 border-secondary/30 bg-card/95">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Transactions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary/20">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-secondary/10 hover:bg-secondary/10">
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${order.buyer_id === user?.id ? 'text-accent' : 'text-primary'}`}>
                            {order.buyer_id === user?.id ? 'BUY' : 'SELL'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {order.quantity.toFixed(2)} kWh
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {(order.total_price / order.quantity).toFixed(6)} ETH
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          {order.total_price.toFixed(4)} ETH
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              order.status === 'completed'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-yellow-400/20 text-yellow-600'
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Recent Transactions */}
            <Card className="p-6 border-secondary/30 bg-card/95">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Transactions
              </h2>
              {transactionHistory.length > 0 ? (
                <div className="space-y-3">
                  {transactionHistory.slice(0, 10).map((tx) => {
                    const isBuyer = tx.buyer_id === user?.id;
                    const isCompleted = tx.status === 'completed';
                    const otherParty = isBuyer ? tx.seller : tx.buyer;
                    
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-secondary/20 bg-secondary/5 hover:bg-secondary/10 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isBuyer ? 'bg-destructive/20' : 'bg-primary/20'}`}>
                            {isBuyer ? (
                              <ArrowDownLeft className="w-4 h-4 text-destructive" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {isBuyer ? 'Purchased' : 'Sold'} {tx.quantity.toFixed(2)} kWh
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {otherParty ? `${isBuyer ? 'from' : 'to'} ${otherParty.username}` : 'Unknown party'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isBuyer ? 'text-destructive' : 'text-primary'}`}>
                            {isBuyer ? '-' : '+'}{tx.total_price.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          isCompleted
                            ? 'bg-primary/20 text-primary'
                            : tx.status === 'pending'
                            ? 'bg-yellow-400/20 text-yellow-600'
                            : 'bg-destructive/20 text-destructive'
                        }`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No transactions yet</p>
              )}
            </Card>

            {/* Leaderboard */}
            <Card className="p-6 border-secondary/30 bg-card/95">
              <h2 className="text-lg font-semibold text-foreground mb-4">Global Leaderboard</h2>
              <div className="space-y-3">
                {leaderboard.map((trader, index) => (
                  <div
                    key={trader.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      trader.id === user?.id
                        ? 'bg-primary/15 border border-primary/30'
                        : 'bg-secondary/10 border border-secondary/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-primary w-8">#{index + 1}</span>
                      <div>
                        <p className="font-semibold text-foreground">{trader.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {trader.wallet_address.slice(0, 6)}...{trader.wallet_address.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{trader.total_traded.toFixed(2)} kWh</p>
                      <p className="text-xs text-muted-foreground">Total Traded</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
