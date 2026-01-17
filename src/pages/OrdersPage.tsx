import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-yellow-500', label: 'Pending' },
  processing: { icon: Package, color: 'bg-blue-500', label: 'Processing' },
  shipped: { icon: Truck, color: 'bg-purple-500', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-green-500', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'bg-red-500', label: 'Cancelled' },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setIsLoading(false);
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-4">Start shopping to see your orders here!</p>
              <Button asChild className="gradient-primary text-primary-foreground">
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        <CardTitle className="text-lg font-mono">{order.id.slice(0, 8).toUpperCase()}</CardTitle>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Placed on</p>
                          <p className="font-medium">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {order.order_items.map(item => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div>
                        {order.shipping_address && (
                          <p className="text-sm text-muted-foreground">
                            Shipping to: {order.shipping_address}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="text-xl font-bold text-gradient-primary">₹{Number(order.total_amount).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
