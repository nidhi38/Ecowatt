'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  getOrCreateUser, 
  getSellListings, 
  getBuyListings,
  createListing, 
  createOrder, 
  completeOrder,
  logActivity,
  updateUserBalance,
  getUser,
  getUserOrders
} from '@/lib/db-helpers';
import type { User, EnergyListing } from '@/lib/supabase';

export function MarketplaceClient() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sellListings, setSellListings] = useState<EnergyListing[]>([]);
  const [buyListings, setBuyListings] = useState<EnergyListing[]>([]);
  const [isCreatingListing, setIsCreatingListing] = useState(false);
  const [listingType, setListingType] = useState<'buy' | 'sell'>('sell');
  const [amount, setAmount] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address) {
      loadData();
    }
  }, [mounted, isConnected, address]);

  const loadData = async () => {
    try {
      const userData = await getOrCreateUser(address!);
      setUser(userData);
      
      const [sells, buys] = await Promise.all([
        getSellListings(),
        getBuyListings()
      ]);
      
      setSellListings(sells);
      setBuyListings(buys);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading marketplace data');
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !pricePerUnit) return;

    setIsLoading(true);
    setMessage('');

    try {
      const listing = await createListing(
        user.id,
        parseFloat(amount),
        parseFloat(pricePerUnit),
        listingType
      );

      if (listing) {
        await logActivity(user.id, 'list', parseFloat(amount), parseFloat(pricePerUnit));
        setMessage(`✓ Listing created successfully!`);
        setAmount('');
        setPricePerUnit('');
        setIsCreatingListing(false);
        await loadData();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setMessage('Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyEnergy = async (listing: EnergyListing) => {
    if (!user) return;

    setIsLoading(true);
    setMessage('');

    try {
      const totalPrice = listing.quantity * listing.price_per_unit;

      if (user.balance < totalPrice) {
        setMessage('✗ Insufficient balance');
        return;
      }

      // Create order
      const order = await createOrder(
        user.id,
        listing.user_id,
        listing.id,
        listing.quantity,
        totalPrice
      );

      if (order) {
        // Update buyer balance
        const newBuyerBalance = user.balance - totalPrice;
        await updateUserBalance(user.id, newBuyerBalance);

        // Update seller balance
        const seller = await getUser(listing.user_id);
        if (seller) {
          const newSellerBalance = seller.balance + totalPrice;
          await updateUserBalance(seller.id, newSellerBalance);
        }

        // Mark order as completed
        await completeOrder(order.id, '0x' + Math.random().toString(16).slice(2));

        // Log activity for both users
        await logActivity(user.id, 'buy', listing.quantity, listing.price_per_unit);
        await logActivity(listing.user_id, 'sell', listing.quantity, listing.price_per_unit);

        setMessage(`✓ Successfully purchased ${listing.quantity} kWh!`);
        
        // Reload data
        const updatedUser = await getOrCreateUser(address!);
        setUser(updatedUser);
        await loadData();

        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error buying energy:', error);
      setMessage('✗ Failed to complete purchase');
    } finally {
      setIsLoading(false);
    }
  };

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
            <p className="text-muted-foreground mb-8">You need to connect your wallet to access the marketplace</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">Return to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/">
              <Button variant="outline" className="mb-4">← Back to Dashboard</Button>
            </Link>
            <h1 className="text-4xl font-bold text-primary">Energy Marketplace</h1>
            <p className="text-muted-foreground mt-2">Buy and sell renewable energy</p>
            {user && (
              <p className="text-sm text-primary mt-2">Balance: {user.balance.toFixed(2)} kWh</p>
            )}
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.startsWith('✓') 
              ? 'bg-primary/20 border-primary/30 text-primary' 
              : 'bg-destructive/20 border-destructive/30 text-destructive'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Listing Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border border-border sticky top-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Create Listing</h2>
              
              {isCreatingListing ? (
                <form onSubmit={handleCreateListing} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Type
                    </label>
                    <select
                      value={listingType}
                      onChange={(e) => setListingType(e.target.value as 'buy' | 'sell')}
                      className="w-full p-2 bg-input border border-border rounded text-foreground"
                    >
                      <option value="sell">Sell Energy</option>
                      <option value="buy">Buy Energy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Energy Amount (kWh)
                    </label>
                    <Input
                      type="number"
                      placeholder="10.5"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Price per Unit
                    </label>
                    <Input
                      type="number"
                      placeholder="45.50"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                  {amount && pricePerUnit && (
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm text-muted-foreground">
                        Total: <span className="font-bold text-foreground">{(parseFloat(amount) * parseFloat(pricePerUnit)).toFixed(2)} kWh</span>
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90">
                      {isLoading ? 'Creating...' : 'Create'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setIsCreatingListing(false);
                        setAmount('');
                        setPricePerUnit('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button 
                  onClick={() => setIsCreatingListing(true)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Create New Listing
                </Button>
              )}
            </Card>
          </div>

          {/* Listings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sell Listings */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Available Energy to Buy</h2>
              {sellListings.length === 0 ? (
                <Card className="p-8 bg-card text-center border border-border">
                  <p className="text-muted-foreground">No sell listings available</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sellListings.map((listing) => (
                    <Card key={listing.id} className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-foreground mb-1">Energy Listing</h3>
                          <p className="text-sm text-muted-foreground">Seller: {listing.user_id.slice(0, 8)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{listing.quantity} kWh</p>
                          <p className="text-sm text-muted-foreground">@ {listing.price_per_unit.toFixed(2)}/kWh</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <span className="font-bold text-foreground">Total: {(listing.quantity * listing.price_per_unit).toFixed(2)} kWh</span>
                        <Button 
                          onClick={() => handleBuyEnergy(listing)}
                          disabled={isLoading}
                          className="bg-secondary hover:bg-secondary/90"
                        >
                          {isLoading ? 'Processing...' : 'Buy'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Buy Listings */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Buy Offers</h2>
              {buyListings.length === 0 ? (
                <Card className="p-8 bg-card text-center border border-border">
                  <p className="text-muted-foreground">No buy listings available</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {buyListings.map((listing) => (
                    <Card key={listing.id} className="p-6 bg-card border border-border hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-foreground mb-1">Buy Request</h3>
                          <p className="text-sm text-muted-foreground">Buyer: {listing.user_id.slice(0, 8)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-accent">{listing.quantity} kWh</p>
                          <p className="text-sm text-muted-foreground">@ {listing.price_per_unit.toFixed(2)}/kWh</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <span className="font-bold text-foreground">Total: {(listing.quantity * listing.price_per_unit).toFixed(2)} kWh</span>
                        <Button 
                          className="bg-accent hover:bg-accent/90"
                        >
                          Sell
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
