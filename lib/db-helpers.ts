import { supabase, type User, type EnergyListing, type Order, type Activity } from './supabase';

// User functions
export async function getOrCreateUser(walletAddress: string): Promise<User | null> {
  try {
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create new user
      const newUser = {
        wallet_address: walletAddress.toLowerCase(),
        username: `User-${walletAddress.slice(2, 8)}`,
        balance: 1000, // Initial balance for demo
        total_traded: 0,
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (createError) throw createError;
      return createdUser as User;
    }

    if (error) throw error;
    return user as User;
  } catch (error) {
    console.error('Error getting/creating user:', error);
    return null;
  }
}

export async function getUser(walletAddress: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function updateUserBalance(userId: string, newBalance: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user balance:', error);
  }
}

// Listing functions
export async function createListing(
  userId: string,
  quantity: number,
  pricePerUnit: number,
  listingType: 'buy' | 'sell'
): Promise<EnergyListing | null> {
  try {
    const { data, error } = await supabase
      .from('energy_listings')
      .insert([
        {
          user_id: userId,
          quantity,
          price_per_unit: pricePerUnit,
          listing_type: listingType,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as EnergyListing;
  } catch (error) {
    console.error('Error creating listing:', error);
    return null;
  }
}

export async function getActiveListings(): Promise<EnergyListing[]> {
  try {
    const { data, error } = await supabase
      .from('energy_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as EnergyListing[];
  } catch (error) {
    console.error('Error getting listings:', error);
    return [];
  }
}

export async function getBuyListings(): Promise<EnergyListing[]> {
  try {
    const { data, error } = await supabase
      .from('energy_listings')
      .select('*')
      .eq('status', 'active')
      .eq('listing_type', 'buy')
      .order('price_per_unit', { ascending: false });

    if (error) throw error;
    return (data || []) as EnergyListing[];
  } catch (error) {
    console.error('Error getting buy listings:', error);
    return [];
  }
}

export async function getSellListings(): Promise<EnergyListing[]> {
  try {
    const { data, error } = await supabase
      .from('energy_listings')
      .select('*')
      .eq('status', 'active')
      .eq('listing_type', 'sell')
      .order('price_per_unit', { ascending: true });

    if (error) throw error;
    return (data || []) as EnergyListing[];
  } catch (error) {
    console.error('Error getting sell listings:', error);
    return [];
  }
}

export async function cancelListing(listingId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('energy_listings')
      .update({ status: 'cancelled' })
      .eq('id', listingId);

    if (error) throw error;
  } catch (error) {
    console.error('Error cancelling listing:', error);
  }
}

// Order functions
export async function createOrder(
  buyerId: string,
  sellerId: string,
  listingId: string,
  quantity: number,
  totalPrice: number
): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          buyer_id: buyerId,
          seller_id: sellerId,
          listing_id: listingId,
          quantity,
          total_price: totalPrice,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Order[];
  } catch (error) {
    console.error('Error getting user orders:', error);
    return [];
  }
}

export async function completeOrder(orderId: string, txHash: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed', tx_hash: txHash, completed_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error completing order:', error);
  }
}

// Activity functions
export async function logActivity(
  userId: string,
  type: 'buy' | 'sell' | 'list' | 'cancel',
  quantity: number,
  price: number
): Promise<void> {
  try {
    const { error } = await supabase
      .from('activity')
      .insert([
        {
          user_id: userId,
          type,
          quantity,
          price,
          timestamp: new Date().toISOString(),
        },
      ]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

export async function getLeaderboard(limit: number = 10): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('total_traded', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as User[];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

export async function getPriceHistory(limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('price_history')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).reverse();
  } catch (error) {
    console.error('Error getting price history:', error);
    return [];
  }
}

export async function recordPrice(price: number, volume: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('price_history')
      .insert([
        {
          timestamp: new Date().toISOString(),
          price,
          volume,
        },
      ]);

    if (error) throw error;
  } catch (error) {
    console.error('Error recording price:', error);
  }
}

// Role functions
export async function getUserRole(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create default role
      const { data: newRole } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: 'consumer',
          permissions: ['view_marketplace', 'place_orders', 'view_portfolio']
        }])
        .select()
        .single();
      return newRole;
    }

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function updateUserRole(userId: string, role: 'producer' | 'consumer' | 'admin'): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user role:', error);
  }
}

// Notification functions
export async function getNotifications(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []);
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

export async function getUnreadNotifications(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []);
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
}

export async function createNotification(
  userId: string,
  type: 'trade_alert' | 'price_trigger' | 'system_announcement' | 'order_update',
  title: string,
  message: string,
  orderId?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        related_order_id: orderId || null,
        data: {}
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Audit Logs functions
export async function logUserActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any,
  ipAddress?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_logs_user_activity')
      .insert([{
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || {},
        ip_address: ipAddress,
        timestamp: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
}

export async function getUserActivityLogs(userId: string, limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs_user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []);
  } catch (error) {
    console.error('Error getting user activity logs:', error);
    return [];
  }
}

export async function logTransactionAudit(
  transactionId: string,
  buyerId: string,
  sellerId: string,
  action: string,
  amount: number,
  status?: string,
  txHash?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_logs_transactions')
      .insert([{
        transaction_id: transactionId,
        buyer_id: buyerId,
        seller_id: sellerId,
        action,
        amount,
        status,
        tx_hash: txHash,
        change_log: {},
        timestamp: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging transaction audit:', error);
  }
}

export async function getTransactionAuditLogs(userId: string, limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs_transactions')
      .select('*')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []);
  } catch (error) {
    console.error('Error getting transaction audit logs:', error);
    return [];
  }
}

export async function logAccessAudit(
  userId: string,
  action: 'login' | 'logout' | 'access_denied' | 'permission_change',
  resource: string,
  status: 'success' | 'failed',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('audit_logs_access')
      .insert([{
        user_id: userId,
        action,
        resource,
        status,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging access audit:', error);
  }
}

export async function getAccessAuditLogs(userId: string, limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs_access')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []);
  } catch (error) {
    console.error('Error getting access audit logs:', error);
    return [];
  }
}

// Token functions
export async function getEWTBalance(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('ewt_tokens')
      .select('token_balance')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create default token record
      await supabase
        .from('ewt_tokens')
        .insert([{
          user_id: userId,
          token_balance: 0,
          total_earned: 0,
          total_spent: 0
        }]);
      return 0;
    }

    if (error) throw error;
    return data?.token_balance || 0;
  } catch (error) {
    console.error('Error getting EWT balance:', error);
    return 0;
  }
}

export async function getEWTTokenInfo(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('ewt_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      return { token_balance: 0, total_earned: 0, total_spent: 0 };
    }

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting EWT token info:', error);
    return { token_balance: 0, total_earned: 0, total_spent: 0 };
  }
}

export async function addTokenBalance(userId: string, amount: number, reason: string, orderId?: string): Promise<void> {
  try {
    // Update balance
    const currentBalance = await getEWTBalance(userId);
    const { error: updateError } = await supabase
      .from('ewt_tokens')
      .update({ 
        token_balance: currentBalance + amount,
        total_earned: amount > 0 ? (await getEWTTokenInfo(userId)).total_earned + amount : (await getEWTTokenInfo(userId)).total_earned
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Log transaction
    await supabase
      .from('token_transactions')
      .insert([{
        user_id: userId,
        transaction_type: amount > 0 ? 'earn' : 'spend',
        amount: Math.abs(amount),
        reason,
        order_id: orderId,
        created_at: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Error adding token balance:', error);
  }
}

export async function getTokenTransactionHistory(userId: string, limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []);
  } catch (error) {
    console.error('Error getting token transaction history:', error);
    return [];
  }
}
