'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function DatabaseInit() {
  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Check if users table exists
        const { data, error } = await supabase
          .from('users')
          .select('count()', { count: 'exact' })
          .limit(1);

        if (error && error.code === 'PGRST116') {
          // Table doesn't exist, create it
          console.log('Creating database tables...');
          
          const sql = `
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              wallet_address TEXT UNIQUE NOT NULL,
              username TEXT NOT NULL,
              avatar_url TEXT,
              balance DECIMAL(18, 2) DEFAULT 1000,
              total_traded DECIMAL(18, 2) DEFAULT 0,
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS energy_listings (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              quantity DECIMAL(18, 2) NOT NULL,
              price_per_unit DECIMAL(18, 8) NOT NULL,
              listing_type TEXT NOT NULL CHECK (listing_type IN ('buy', 'sell')),
              status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS orders (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              listing_id UUID NOT NULL REFERENCES energy_listings(id) ON DELETE CASCADE,
              quantity DECIMAL(18, 2) NOT NULL,
              total_price DECIMAL(18, 8) NOT NULL,
              status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
              tx_hash TEXT,
              created_at TIMESTAMP DEFAULT NOW(),
              completed_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS price_history (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              timestamp TIMESTAMP DEFAULT NOW(),
              price DECIMAL(18, 8) NOT NULL,
              volume DECIMAL(18, 2) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS activity (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'list', 'cancel')),
              quantity DECIMAL(18, 2) NOT NULL,
              price DECIMAL(18, 8) NOT NULL,
              timestamp TIMESTAMP DEFAULT NOW()
            );
          `;

          // Note: Direct SQL execution via client is not available
          // Use the seed data script instead during development
          console.log('Please run the database initialization script');
        }
      } catch (error) {
        console.error('Database init error:', error);
      }
    };

    initDatabase();
  }, []);

  return null;
}
