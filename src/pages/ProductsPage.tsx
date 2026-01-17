import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Grid, List, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('name');
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setIsLoading(true);
    let query = supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_available', true);

    if (selectedCategory && selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    if (sortBy === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price-high') {
      query = query.order('price', { ascending: false });
    } else {
      query = query.order('name');
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load products');
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    setCategories(data || []);
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
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', product.id)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock_quantity) {
        toast.error('Not enough stock available');
        return;
      }
      await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);
    } else {
      // Add new item
      await supabase
        .from('cart_items')
        .insert({ cart_id: cart.id, product_id: product.id, quantity: 1 });
    }

    toast.success(`${product.name} added to cart!`);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">{filteredProducts.length} products found</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found</p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-4">
              Clear filters
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-glow transition-all duration-300">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                  {product.stock_quantity === 0 && (
                    <Badge className="absolute top-2 right-2 bg-destructive">Out of Stock</Badge>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-primary mb-1">{product.categories?.name || 'Uncategorized'}</p>
                  <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gradient-primary">₹{product.price.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{product.stock_quantity} in stock</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/products/${product.id}`}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Link>
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-glow transition-all">
                <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-primary mb-1">{product.categories?.name || 'Uncategorized'}</p>
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-xl font-bold text-gradient-primary">₹{product.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground ml-2">{product.stock_quantity} in stock</span>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/products/${product.id}`}>View Details</Link>
                      </Button>
                      <Button
                        size="sm"
                        className="gradient-primary text-primary-foreground"
                        onClick={() => addToCart(product)}
                        disabled={product.stock_quantity === 0}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
