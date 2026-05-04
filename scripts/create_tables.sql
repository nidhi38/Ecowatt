-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  total_trades BIGINT DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  energy_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create energy listings table
CREATE TABLE IF NOT EXISTS energy_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price_per_unit NUMERIC NOT NULL CHECK (price_per_unit > 0),
  available_quantity NUMERIC NOT NULL,
  energy_type TEXT DEFAULT 'solar',
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES energy_listings(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  total_price NUMERIC NOT NULL,
  order_type TEXT NOT NULL DEFAULT 'market',
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create price history table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  energy_type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  average_price NUMERIC,
  high_price NUMERIC,
  low_price NUMERIC,
  volume NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC,
  price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create portfolio table
CREATE TABLE IF NOT EXISTS portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  energy_held NUMERIC DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  average_buy_price NUMERIC DEFAULT 0,
  average_sell_price NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_energy_listings_seller_id ON energy_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_energy_listings_status ON energy_listings(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_price_history_energy_type ON price_history(energy_type);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view all users
CREATE POLICY "users_select" ON users
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "users_update" ON users
  FOR UPDATE USING (auth.uid()::text = wallet_address);

-- Everyone can view listings
CREATE POLICY "listings_select" ON energy_listings
  FOR SELECT USING (true);

-- Users can insert listings
CREATE POLICY "listings_insert" ON energy_listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Users can update their own listings
CREATE POLICY "listings_update" ON energy_listings
  FOR UPDATE USING (auth.uid() = seller_id);

-- Users can view all orders
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (true);

-- Users can insert orders
CREATE POLICY "orders_insert" ON orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Everyone can view activity
CREATE POLICY "activity_select" ON user_activity
  FOR SELECT USING (true);

-- Users can view their portfolio
CREATE POLICY "portfolio_select" ON portfolio
  FOR SELECT USING (auth.uid() = user_id);

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE energy_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE price_history;
