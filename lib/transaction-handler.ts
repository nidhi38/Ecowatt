import { supabase } from './supabase';
import { getEWTBalance, addTokenBalance, logTransactionAudit, createNotification } from './db-helpers';

interface TransactionParams {
  buyerId: string;
  sellerId: string;
  listingId: string;
  quantity: number;
  pricePerUnit: number;
  transactionType: 'buy' | 'sell';
}

export async function executeTransaction(params: TransactionParams): Promise<{ success: boolean; message: string; orderId?: string }> {
  try {
    const { buyerId, sellerId, listingId, quantity, pricePerUnit, transactionType } = params;
    const totalPrice = quantity * pricePerUnit;

    // Get buyer and seller info
    const [buyerRes, sellerRes] = await Promise.all([
      supabase.from('users').select('*').eq('id', buyerId).single(),
      supabase.from('users').select('*').eq('id', sellerId).single()
    ]);

    const buyer = buyerRes.data;
    const seller = sellerRes.data;

    if (!buyer || !seller) {
      return { success: false, message: 'Invalid buyer or seller' };
    }

    // Check if buyer has sufficient balance
    if (buyer.balance < totalPrice) {
      return { 
        success: false, 
        message: `Insufficient balance. You need ${totalPrice} kWh but have ${buyer.balance} kWh` 
      };
    }

    // Create transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        buyer_id: buyerId,
        seller_id: sellerId,
        listing_id: listingId,
        quantity,
        total_price: totalPrice,
        status: 'completed',
        tx_hash: '0x' + Math.random().toString(16).slice(2),
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Update buyer balance (decrease)
    const newBuyerBalance = buyer.balance - totalPrice;
    const { error: buyerUpdateError } = await supabase
      .from('users')
      .update({ balance: newBuyerBalance, updated_at: new Date().toISOString() })
      .eq('id', buyerId);

    if (buyerUpdateError) throw buyerUpdateError;

    // Update seller balance (increase)
    const newSellerBalance = seller.balance + totalPrice;
    const { error: sellerUpdateError } = await supabase
      .from('users')
      .update({ balance: newSellerBalance, updated_at: new Date().toISOString() })
      .eq('id', sellerId);

    if (sellerUpdateError) throw sellerUpdateError;

    // Add activity log
    const { error: activityError } = await supabase
      .from('activity')
      .insert([{
        user_id: buyerId,
        type: 'buy',
        quantity,
        price: pricePerUnit,
        timestamp: new Date().toISOString()
      }]);

    if (activityError) console.warn('Activity log error:', activityError);

    // Add seller activity
    const { error: sellerActivityError } = await supabase
      .from('activity')
      .insert([{
        user_id: sellerId,
        type: 'sell',
        quantity,
        price: pricePerUnit,
        timestamp: new Date().toISOString()
      }]);

    if (sellerActivityError) console.warn('Seller activity log error:', sellerActivityError);

    // Log transaction audit
    await logTransactionAudit(
      order.id,
      buyerId,
      sellerId,
      'completed',
      totalPrice,
      'completed',
      order.tx_hash
    );

    // Add token rewards (1% of transaction value)
    const tokenReward = totalPrice * 0.01;
    await addTokenBalance(buyerId, tokenReward, `Trade rewards for buying ${quantity} kWh`, order.id);
    await addTokenBalance(sellerId, tokenReward, `Trade rewards for selling ${quantity} kWh`, order.id);

    // Create notifications
    await createNotification(
      buyerId,
      'order_update',
      'Purchase Completed',
      `You successfully purchased ${quantity} kWh for ${totalPrice} tokens`,
      order.id
    );

    await createNotification(
      sellerId,
      'order_update',
      'Sale Completed',
      `You successfully sold ${quantity} kWh for ${totalPrice} tokens`,
      order.id
    );

    return {
      success: true,
      message: `Transaction completed! ${quantity} kWh transferred.`,
      orderId: order.id
    };
  } catch (error) {
    console.error('Transaction error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Transaction failed'
    };
  }
}

export async function getTransactionHistory(userId: string, limit: number = 50): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:users!buyer_id(id, username, wallet_address, avatar_url),
        seller:users!seller_id(id, username, wallet_address, avatar_url)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
}
