'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getOrCreateUser,
  getUserRole,
  getEWTTokenInfo,
  getTokenTransactionHistory,
} from '@/lib/db-helpers';
import { Copy, Shield, Wallet, Award, History } from 'lucide-react';

interface UserRole {
  role: 'producer' | 'consumer' | 'admin';
  permissions: string[];
}

interface TokenInfo {
  token_balance: number;
  total_earned: number;
  total_spent: number;
}

export function SettingsTokenPage() {
  const { address, disconnect } = useAccount();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    token_balance: 0,
    total_earned: 0,
    total_spent: 0,
  });
  const [tokenHistory, setTokenHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !address) return;

    const fetchSettings = async () => {
      try {
        const userData = await getOrCreateUser(address);
        setUser(userData);

        if (userData) {
          const role = await getUserRole(userData.id);
          setUserRole(role);

          const tokens = await getEWTTokenInfo(userData.id);
          setTokenInfo(tokens);

          const history = await getTokenTransactionHistory(userData.id, 20);
          setTokenHistory(history);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [mounted, address]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted || loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'producer':
        return 'bg-green-100 text-green-800';
      case 'consumer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator with full platform access and management capabilities';
      case 'producer':
        return 'Energy producer who can list and sell energy on the marketplace';
      case 'consumer':
        return 'Energy consumer who can purchase and trade energy';
      default:
        return 'User role';
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Settings & Tokens</h2>
        <p className="text-muted-foreground">Manage your profile, role, and EcoWatt tokens</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6 border-secondary/30">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Profile Information
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Username</p>
            <p className="font-semibold text-foreground">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-secondary/10 px-3 py-2 rounded border border-secondary/20 flex-1">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(address || '')}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Account Balance</p>
            <p className="text-2xl font-bold text-primary">${user?.balance?.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Role & Permissions Section */}
      <Card className="p-6 border-secondary/30">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Role & Permissions
        </h3>
        {userRole ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Role</p>
              <Badge className={`capitalize ${getRoleColor(userRole.role)}`}>
                {userRole.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Description</p>
              <p className="text-sm text-foreground">{getRoleDescription(userRole.role)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-3">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {userRole.permissions && userRole.permissions.length > 0 ? (
                  userRole.permissions.map((perm, idx) => (
                    <Badge key={idx} variant="outline" className="capitalize">
                      {perm.replace(/_/g, ' ')}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No specific permissions</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Loading role information...</p>
        )}
      </Card>

      {/* EWT Token Management */}
      <Card className="p-6 border-secondary/30 bg-gradient-to-br from-accent/10 to-transparent">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-accent" />
          EcoWatt Token (EWT)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-background rounded-lg border border-secondary/20">
            <p className="text-sm text-muted-foreground mb-2">Token Balance</p>
            <p className="text-2xl font-bold text-accent">{tokenInfo.token_balance.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">EWT</p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-secondary/20">
            <p className="text-sm text-muted-foreground mb-2">Total Earned</p>
            <p className="text-2xl font-bold text-green-600">{tokenInfo.total_earned.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">EWT</p>
          </div>
          <div className="p-4 bg-background rounded-lg border border-secondary/20">
            <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
            <p className="text-2xl font-bold text-red-600">{tokenInfo.total_spent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">EWT</p>
          </div>
        </div>
      </Card>

      {/* Token Transaction History */}
      <Card className="p-6 border-secondary/30">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Recent Token Transactions
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tokenHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No token transactions yet</p>
          ) : (
            tokenHistory.map(tx => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-secondary/5 rounded border border-secondary/20 hover:bg-secondary/10 transition"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground capitalize">
                    {tx.transaction_type}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.reason}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.transaction_type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.transaction_type === 'earn' ? '+' : '-'}{tx.amount.toFixed(2)} EWT
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Security & Session */}
      <Card className="p-6 border-secondary/30">
        <h3 className="text-lg font-semibold text-foreground mb-4">Security</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start gap-2" disabled>
            <Shield className="w-4 h-4" />
            Two-Factor Authentication (Coming Soon)
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start gap-2"
            onClick={() => disconnect()}
          >
            Disconnect Wallet
          </Button>
        </div>
      </Card>
    </div>
  );
}
