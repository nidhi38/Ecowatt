-- Insert sample users
INSERT INTO users (wallet_address, username, bio, total_trades, energy_balance) VALUES
  ('0x1234567890123456789012345678901234567890', 'AlexGreen', 'Solar energy enthusiast', 45, 1250.50),
  ('0x2345678901234567890123456789012345678901', 'SarahWind', 'Wind energy trader', 78, 2450.25),
  ('0x3456789012345678901234567890123456789012', 'JohnSolar', 'Renewable energy expert', 62, 1820.75),
  ('0x4567890123456789012345678901234567890123', 'EmilyGreen', 'Clean energy advocate', 34, 950.30),
  ('0x5678901234567890123456789012345678901234', 'MikeWatt', 'Energy market analyst', 91, 3100.00)
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert energy listings
INSERT INTO energy_listings (seller_id, quantity, price_per_unit, available_quantity, energy_type, location, status) 
SELECT id, 500, 45.50, 500, 'solar', 'California', 'active'
FROM users WHERE wallet_address = '0x1234567890123456789012345678901234567890'
UNION ALL
SELECT id, 1000, 42.75, 750, 'wind', 'Texas', 'active'
FROM users WHERE wallet_address = '0x2345678901234567890123456789012345678901'
UNION ALL
SELECT id, 300, 48.25, 300, 'solar', 'Arizona', 'active'
FROM users WHERE wallet_address = '0x3456789012345678901234567890123456789012'
ON CONFLICT DO NOTHING;

-- Insert price history
INSERT INTO price_history (energy_type, price, average_price, high_price, low_price, volume) VALUES
  ('solar', 45.50, 44.75, 48.00, 41.25, 15000),
  ('wind', 42.75, 42.00, 45.50, 39.75, 22000),
  ('hydro', 38.50, 38.25, 40.00, 36.50, 8500),
  ('geothermal', 52.00, 51.50, 54.25, 48.75, 5200),
  ('solar', 45.75, 45.00, 49.00, 41.50, 16200);

-- Create portfolio entries
INSERT INTO portfolio (user_id, energy_held, total_spent, total_earned, average_buy_price, average_sell_price)
SELECT id, 1250.50, 54500.00, 62300.00, 43.60, 49.84
FROM users WHERE wallet_address = '0x1234567890123456789012345678901234567890'
UNION ALL
SELECT id, 2450.25, 105000.00, 118500.00, 42.85, 48.37
FROM users WHERE wallet_address = '0x2345678901234567890123456789012345678901'
UNION ALL
SELECT id, 1820.75, 88200.00, 95600.00, 48.45, 52.50
FROM users WHERE wallet_address = '0x3456789012345678901234567890123456789012'
ON CONFLICT (user_id) DO NOTHING;
