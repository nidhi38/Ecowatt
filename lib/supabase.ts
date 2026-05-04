import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frdpmliczbswcnumijnx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url: string | null;
  balance: number;
  total_traded: number;
  created_at: string;
};

export type EnergyListing = {
  id: string;
  user_id: string;
  quantity: number;
  price_per_unit: number;
  listing_type: 'sell' | 'buy';
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'completed' | 'cancelled';
  tx_hash: string | null;
  created_at: string;
  completed_at: string | null;
};

export type PriceHistory = {
  id: string;
  timestamp: string;
  price: number;
  volume: number;
};

export type Activity = {
  id: string;
  user_id: string;
  type: 'buy' | 'sell' | 'list' | 'cancel';
  quantity: number;
  price: number;
  timestamp: string;
};
