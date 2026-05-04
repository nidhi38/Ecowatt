'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from 'recharts';
import { TrendingDown, TrendingUp, Plus, Minus } from 'lucide-react';
import {
  getOrCreateUser,
  getActiveListings,
  getBuyListings,
  getSellListings,
  createListing,
  createOrder,
  logActivity,
} from '@/lib/db-helpers';
import { executeTransaction } from '@/lib/transaction-handler';
import type { User, EnergyListing } from '@/lib/supabase';

export function AdvancedMarketplace() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [buyOrders, setBuyOrders] = useState<EnergyListing[]>([]);
  const [sellOrders, setSellOrders] = useState<EnergyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [mounted, setMounted] = useState(false);

  // Form states
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

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

        const [buy, sell] = await Promise.all([
          getBuyListings(),
          getSellListings(),
        ]);

        setBuyOrders(buy);
        setSellOrders(sell);
      } catch (error) {
        console.error('Error fetching marketplace data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [mounted, isConnected, address]);

  const handlePlaceOrder = async (listing: EnergyListing) => {
    if (!user) return;
    
    setIsProcessing(true);
    setMessage('');

    try {
      // Determine the counterparty
      const isBuying = tab === 'buy'; // If on 'buy' tab, we're buying from sellers
      const buyerId = isBuying ? user.id : listing.user_id;
      const sellerId = isBuying ? listing.user_id : user.id;

      const result = await executeTransaction({
        buyerId,
        sellerId,
        listingId: listing.id,
        quantity: listing.quantity,
        pricePerUnit: listing.price_per_unit,
        transactionType: isBuying ? 'buy' : 'sell'
      });

      if (result.success) {
        setMessage(`✓ ${result.message}`);
        // Refresh data
        const [buy, sell] = await Promise.all([
          getBuyListings(),
          getSellListings(),
        ]);
        setBuyOrders(buy);
        setSellOrders(sell);
        
        // Refresh user balance
        const userData = await getOrCreateUser(address!);
        setUser(userData);
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`✗ ${result.message}`);
      }
    } catch (error) {
      console.error('Order error:', error);
      setMessage('Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !quantity || !price) return;

    try {
      await createListing(user.id, parseFloat(quantity), parseFloat(price), orderType);
      await logActivity(user.id, 'list', parseFloat(quantity), parseFloat(price));
      setQuantity('');
      setPrice('');
      setMessage('');
      
      // Refresh listings
      const [buy, sell] = await Promise.all([
        getBuyListings(),
        getSellListings(),
      ]);
      setBuyOrders(buy);
      setSellOrders(sell);
    } catch (error) {
      console.error('Error creating listing:', error);
      setMessage('Failed to create listing');
    }
  };

  const orderBookData = [
    { price: 0.02, buy: 150, sell: 120 },
    { price: 0.025, buy: 200, sell: 180 },
    { price: 0.03, buy: 250, sell: 220 },
    { price: 0.035, buy: 180, sell: 200 },
    { price: 0.04, buy: 100, sell: 150 },
  ];

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="p-8 text-center border-secondary/30 bg-card/95">
          <p className="text-muted-foreground">Please connect your wallet to access the marketplace</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground mt-2">Buy and sell energy on the decentralized marketplace</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Order Book Chart */}
            <Card className="p-6 border-secondary/30 bg-card/95">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Book Depth</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={orderBookData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="price" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                  <Legend />
                  <Bar dataKey="buy" fill="#a8d8d8" name="Buy Orders" />
                  <Bar dataKey="sell" fill="#f4a8b8" name="Sell Orders" />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Create Listing */}
            <Card className="p-6 border-secondary/30 bg-card/95">
              <h2 className="text-lg font-semibold text-foreground mb-4">Create Order</h2>
              <form onSubmit={handleCreateListing} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Order Type</label>
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as 'buy' | 'sell')}
                      className="w-full px-3 py-2 border border-secondary/30 rounded-lg bg-background text-foreground"
                    >
                      <option value="buy">Buy Order</option>
                      <option value="sell">Sell Order</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Quantity (kWh)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="100"
                      className="border-secondary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Price (ETH/kWh)</label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.025"
                      className="border-secondary/30"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Order
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg border ${message.startsWith('✓') ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-destructive/20 border-destructive/30 text-destructive'}`}>
                {message}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-secondary/30">
              <button
                onClick={() => setTab('buy')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  tab === 'buy'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingDown className="w-5 h-5 inline mr-2" />
                Sell Orders ({sellOrders.length})
              </button>
              <button
                onClick={() => setTab('sell')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  tab === 'sell'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <TrendingUp className="w-5 h-5 inline mr-2" />
                Buy Orders ({buyOrders.length})
              </button>
            </div>

            {/* Orders List */}
            <Card className="p-6 border-secondary/30 bg-card/95">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {tab === 'buy' ? 'Buy Orders - Available Energy to Buy' : 'Sell Orders - Energy for Sale'}
              </h2>
              <div className="space-y-3">
                {(tab === 'buy' ? sellOrders : buyOrders).length > 0 ? (
                  (tab === 'buy' ? sellOrders : buyOrders).slice(0, 10).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-secondary/20 bg-secondary/10 hover:bg-secondary/20 transition"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {order.quantity.toFixed(2)} kWh
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @ {order.price_per_unit.toFixed(6)} ETH/kWh = {(order.quantity * order.price_per_unit).toFixed(4)} ETH
                        </p>
                      </div>
                      <Button
                        onClick={() => handlePlaceOrder(order)}
                        disabled={isProcessing}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        {isProcessing ? 'Processing...' : (tab === 'buy' ? 'Buy' : 'Sell')}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No orders available</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
