import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CartItemWithProduct {
  id: string;
  quantity: number;
  product_id: string;
  products: {
    id: string;
    name: string;
    price: number;
    stock_quantity: number;
    image_url: string | null;
  };
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchCart();
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchCart = async () => {
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user!.id)
      .single();

    if (cart) {
      const { data: items } = await supabase
        .from('cart_items')
        .select('*, products(*)')
        .eq('cart_id', cart.id);

      setCartItems((items || []) as unknown as CartItemWithProduct[]);
    }
    setIsLoading(false);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('phone, address')
      .eq('id', user!.id)
      .single();

    if (data) {
      setPhone(data.phone || '');
      setAddress(data.address || '');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 99;
  const total = subtotal + shipping;

  const handleCheckout = async () => {
    if (!phone.trim() || !address.trim()) {
      toast.error('Please fill in all delivery details');
      return;
    }

    // Validate stock
    for (const item of cartItems) {
      if (item.quantity > item.products.stock_quantity) {
        toast.error(`${item.products.name} has insufficient stock`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user!.id,
          total_amount: total,
          shipping_address: address,
          phone: phone,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.products.name,
        quantity: item.quantity,
        price_at_purchase: item.products.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (cart) {
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ phone, address })
        .eq('id', user!.id);

      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded-xl" />
              <div className="h-96 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    navigate('/products');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Delivery Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Delivery Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Shipping Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address including city and pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.products.image_url ? (
                        <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.products.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(item.products.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-success">Free shipping on orders above ₹5,000!</p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-gradient-primary">₹{total.toLocaleString()}</span>
              </div>

              <Button
                className="w-full mt-6 gradient-primary text-primary-foreground shadow-glow"
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order (Cash on Delivery)'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                By placing this order, you agree to our terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
