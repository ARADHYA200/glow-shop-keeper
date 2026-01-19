import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  categories?: { name: string } | null;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, stock_quantity, image_url, categories(name)')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (!error && data) {
      setProducts(data);
    }
    setIsLoading(false);
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    // Get user's cart
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!cart) {
      toast.error('Cart not found');
      return;
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', product.id)
      .single();

    if (existingItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ cart_id: cart.id, product_id: product.id, quantity: 1 });
    }

    toast.success(`${product.name} added to cart`);
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="text-muted-foreground mt-1">Discover our latest arrivals and bestsellers</p>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link to="/products">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 overflow-hidden bg-muted">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <span className="text-4xl font-bold text-primary/50">{product.name[0]}</span>
                  </div>
                )}
                {product.categories?.name && (
                  <Badge className="absolute top-2 left-2 bg-background/90 text-foreground backdrop-blur-sm">
                    {product.categories.name}
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 h-10 mt-1">
                  {product.description || 'Quality electronics for your home'}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">
                    {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/products/${product.id}`}>View</Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 gradient-primary text-primary-foreground"
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Button asChild className="gradient-primary text-primary-foreground">
            <Link to="/products">
              View All Products <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
