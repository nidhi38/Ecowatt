'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { addTokenBalance } from '@/lib/db-helpers';

interface WalletCreditModalProps {
  userId: string;
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

export function WalletCreditModal({ userId, currentBalance, onBalanceUpdate }: WalletCreditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCredit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const creditAmount = parseFloat(amount);
      const newBalance = currentBalance + creditAmount;

      // Update user balance
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Log activity
      await supabase
        .from('audit_logs_user_activity')
        .insert([{
          user_id: userId,
          action: 'credit_kwh',
          resource_type: 'wallet',
          details: { amount: creditAmount, previous_balance: currentBalance, new_balance: newBalance },
          timestamp: new Date().toISOString()
        }]);

      // Add token transaction
      await addTokenBalance(userId, creditAmount, 'KwH Credit');

      setSuccess(`Successfully credited ${creditAmount} KwH to your wallet!`);
      onBalanceUpdate(newBalance);
      setAmount('');
      setTimeout(() => {
        setIsOpen(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Error crediting wallet:', err);
      setError('Failed to credit wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-primary hover:bg-primary/90"
      >
        <Plus className="w-4 h-4" />
        Credit KwH
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 border-secondary/30 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Credit KwH to Wallet</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-secondary/20 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Current Balance: {currentBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })} KwH
                </label>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Amount to Credit (KwH)
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>

              {amount && (
                <div className="p-3 bg-secondary/20 rounded-lg border border-secondary/30">
                  <p className="text-sm text-foreground">
                    New Balance: <span className="font-semibold text-primary">
                      {(currentBalance + (parseFloat(amount) || 0)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span> KwH
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/20 border border-destructive/30 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-primary/20 border border-primary/30 rounded-lg">
                  <p className="text-sm text-primary">{success}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCredit}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isLoading || !amount}
                >
                  {isLoading ? 'Processing...' : 'Credit KwH'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
