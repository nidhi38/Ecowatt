'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getOrCreateUser,
  getNotifications,
  markNotificationAsRead,
} from '@/lib/db-helpers';
import { Bell, Trash2, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_order_id?: string;
}

export function NotificationsCenter() {
  const { address } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !address) return;

    const fetchNotifications = async () => {
      try {
        const userData = await getOrCreateUser(address);
        if (userData) {
          const notifs = await getNotifications(userData.id);
          setNotifications(notifs);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [mounted, address]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(notifs =>
      notifs.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
  };

  const handleDelete = (notificationId: string) => {
    setNotifications(notifs => notifs.filter(n => n.id !== notificationId));
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'trade_alert':
        return 'bg-blue-100 text-blue-800';
      case 'price_trigger':
        return 'bg-yellow-100 text-yellow-800';
      case 'system_announcement':
        return 'bg-purple-100 text-purple-800';
      case 'order_update':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trade_alert':
        return '📈';
      case 'price_trigger':
        return '💰';
      case 'system_announcement':
        return '📢';
      case 'order_update':
        return '✅';
      default:
        return '📬';
    }
  };

  if (!mounted) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Notifications</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="relative">
          <Bell className="w-8 h-8 text-primary" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card className="p-8 text-center text-muted-foreground">
            Loading notifications...
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No notifications {filter === 'unread' ? 'yet' : 'to display'}</p>
          </Card>
        ) : (
          filteredNotifications.map(notif => (
            <Card
              key={notif.id}
              className={`p-4 border-secondary/20 transition-all ${
                notif.is_read ? 'opacity-70' : 'bg-secondary/5 border-secondary/40'
              }`}
            >
              <div className="flex gap-4">
                <div className="text-2xl">{getNotificationIcon(notif.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{notif.title}</h3>
                      <Badge className={`mt-1 text-xs ${getNotificationColor(notif.type)}`}>
                        {notif.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(notif.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </div>
                <div className="flex gap-2">
                  {!notif.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-primary hover:bg-primary/10"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notif.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
