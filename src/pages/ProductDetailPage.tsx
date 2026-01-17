import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  image_url: string | null;
  category_id: string | null;
  categories?: { name: string } | null;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast.error('Product not found');
      navigate('/products');
    } else {
      setProduct(data);
    }
    setIsLoading(false);
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/auth');
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!cart) {
      toast.error('Cart not found');
      setIsAddingToCart(false);
      return;
    }

    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock_quantity) {
        toast.error('Not enough stock available');
        setIsAddingToCart(false);
        return;
      }
      await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ cart_id: cart.id, product_id: product.id, quantity });
    }

    toast.success(`${product.name} added to cart!`);
    setIsAddingToCart(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-20 bg-muted rounded" />
                <div className="h-12 bg-muted rounded w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-muted relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
            {product.stock_quantity === 0 && (
              <Badge className="absolute top-4 right-4 bg-destructive text-lg px-4 py-2">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit mb-2">
              {product.categories?.name || 'Uncategorized'}
            </Badge>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-muted-foreground text-lg mb-6">{product.description}</p>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-bold text-gradient-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.stock_quantity > 0 && (
                <span className="text-success font-medium">
                  {product.stock_quantity} in stock
                </span>
              )}
            </div>

            {product.stock_quantity > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <Button
              size="lg"
              className="gradient-primary text-primary-foreground shadow-glow w-full sm:w-auto"
              onClick={addToCart}
              disabled={product.stock_quantity === 0 || isAddingToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAddingToCart ? 'Adding...' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
              <div className="flex flex-col items-center text-center p-4">
                <Package className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">Quality Product</span>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Truck className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Shield className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium">Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
