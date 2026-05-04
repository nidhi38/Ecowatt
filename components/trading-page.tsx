'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Zap, Target, Clock } from 'lucide-react';
import { getOrCreateUser, createListing, getPriceHistory } from '@/lib/db-helpers';
import type { User } from '@/lib/supabase';

export function TradingPage() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Order form states
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState(0.03);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      if (!isConnected || !address) return;

      try {
        const userData = await getOrCreateUser(address);
        setUser(userData);

        const prices = await getPriceHistory(50);
        setPriceHistory(prices);

        if (prices.length > 0) {
          const avgPrice =
            prices.reduce((sum, p) => sum + p.price, 0) / prices.length;
          setCurrentPrice(avgPrice);
        }
      } catch (error) {
        console.error('Error fetching trading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, [mounted, isConnected, address]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !quantity) return;

    try {
      const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice);
      await createListing(user.id, parseFloat(quantity), price, side);
      
      setQuantity('');
      setLimitPrice('');
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    }
  };

  const estimatedTotal = quantity
    ? (parseFloat(quantity) * (orderType === 'market' ? currentPrice : parseFloat(limitPrice) || 0)).toFixed(4)
    : '0.0000';

  const spreadData = [
    { price: 0.025, bid: 150 },
    { price: 0.028, bid: 200 },
    { price: 0.03, bid: 250 },
    { price: 0.032, bid: 180 },
    { price: 0.035, bid: 100 },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="p-8 text-center border-secondary/30 bg-card/95">
          <p className="text-muted-foreground">Connect your wallet to start trading</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Advanced Trading</h1>
          <p className="text-muted-foreground mt-2">Place market and limit orders with precision</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Form */}
            <Card className="lg:col-span-1 p-6 border-secondary/30 bg-card/95 h-fit">
              <h2 className="text-lg font-semibold text-foreground mb-6">Place Order</h2>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Order Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Order Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('market')}
                      className={`py-2 px-3 rounded-lg font-medium transition ${
                        orderType === 'market'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
                      }`}
                    >
                      Market
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('limit')}
                      className={`py-2 px-3 rounded-lg font-medium transition ${
                        orderType === 'limit'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
                      }`}
                    >
                      Limit
                    </button>
                  </div>
                </div>

                {/* Buy/Sell */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Side
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSide('buy')}
                      className={`py-2 px-3 rounded-lg font-medium transition ${
                        side === 'buy'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
                      }`}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide('sell')}
                      className={`py-2 px-3 rounded-lg font-medium transition ${
                        side === 'sell'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/20 text-foreground hover:bg-secondary/30'
                      }`}
                    >
                      Sell
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantity (kWh)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="100"
                    className="border-secondary/30"
                  />
                </div>

                {/* Current Price Display */}
                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                  <p className="text-xl font-bold text-primary">
                    {currentPrice.toFixed(6)} ETH/kWh
                  </p>
                </div>

                {/* Limit Price (if limit order) */}
                {orderType === 'limit' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Limit Price (ETH/kWh)
                    </label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="0.03"
                      className="border-secondary/30"
                    />
                  </div>
                )}

                {/* Total */}
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Estimated Total</p>
                  <p className="text-xl font-bold text-primary">{estimatedTotal} ETH</p>
                </div>

                {/* Balance Check */}
                {user && side === 'buy' && (
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <p className="text-xs text-muted-foreground">Available Balance</p>
                    <p className="text-sm font-semibold text-foreground">
                      {user.balance.toFixed(2)} kWh
                    </p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className={`w-full font-semibold py-6 ${
                    side === 'buy'
                      ? 'bg-accent hover:bg-accent/90'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {orderType === 'market' ? 'Execute' : 'Place'} {side.toUpperCase()} Order
                </Button>
              </form>
            </Card>

            {/* Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Chart */}
              <Card className="p-6 border-secondary/30 bg-card/95">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary" />
                  Price History
                </h2>
                {priceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="timestamp" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#a8d8d8"
                        name="ETH/kWh"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </Card>

              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-secondary/30 bg-gradient-to-br from-card to-primary/5">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Best Ask</p>
                      <p className="text-lg font-bold text-primary">0.0305 ETH</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-secondary/30 bg-gradient-to-br from-card to-accent/5">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Best Bid</p>
                      <p className="text-lg font-bold text-accent">0.0295 ETH</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-secondary/30 bg-gradient-to-br from-card to-secondary/5">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Spread</p>
                      <p className="text-lg font-bold text-secondary">0.0010 ETH</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
