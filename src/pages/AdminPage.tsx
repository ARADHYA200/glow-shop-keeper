import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, ShoppingCart, Users, BarChart3, Plus, Edit, Trash2, 
  Eye, EyeOff, ArrowLeft, Search, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
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

interface Order {
  id: string;
  total_amount: number;
  status: string;
  shipping_address: string | null;
  phone: string | null;
  created_at: string;
  profiles?: { full_name: string | null; email: string } | null;
  order_items: { product_name: string; quantity: number; price_at_purchase: number }[];
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Product form state
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productAvailable, setProductAvailable] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        toast.error('Access denied. Admin only.');
        navigate('/');
      } else {
        fetchData();
      }
    }
  }, [user, isAdmin, authLoading]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchProducts(), fetchCategories(), fetchOrders()]);
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email), order_items(*)')
      .order('created_at', { ascending: false });
    setOrders((data || []) as unknown as Order[]);
  };

  const resetProductForm = () => {
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductStock('');
    setProductCategory('');
    setProductImage('');
    setProductAvailable(true);
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductDescription(product.description || '');
    setProductPrice(product.price.toString());
    setProductStock(product.stock_quantity.toString());
    setProductCategory(product.category_id || '');
    setProductImage(product.image_url || '');
    setProductAvailable(product.is_available);
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productName || !productPrice) {
      toast.error('Name and price are required');
      return;
    }

    const productData = {
      name: productName,
      description: productDescription || null,
      price: parseFloat(productPrice),
      stock_quantity: parseInt(productStock) || 0,
      category_id: productCategory || null,
      image_url: productImage || null,
      is_available: productAvailable,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      
      if (error) {
        toast.error('Failed to update product');
      } else {
        toast.success('Product updated successfully');
      }
    } else {
      const { error } = await supabase.from('products').insert(productData);
      
      if (error) {
        toast.error('Failed to add product');
      } else {
        toast.success('Product added successfully');
      }
    }

    setIsProductDialogOpen(false);
    resetProductForm();
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success('Product deleted');
      fetchProducts();
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success('Order status updated');
      fetchOrders();
    }
  };

  const updateStock = async (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newStock = Math.max(0, product.stock_quantity + change);
    
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);
    
    if (error) {
      toast.error('Failed to update stock');
    } else {
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-primary' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-accent' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'pending').length, icon: BarChart3, color: 'text-yellow-500' },
    { label: 'Low Stock', value: products.filter(p => p.stock_quantity < 5).length, icon: Package, color: 'text-destructive' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Link>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                  <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                    setIsProductDialogOpen(open);
                    if (!open) resetProductForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button className="gradient-primary text-primary-foreground">
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Price (₹) *</Label>
                            <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock</Label>
                            <Input type="number" value={productStock} onChange={(e) => setProductStock(e.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={productCategory} onValueChange={setProductCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Image URL</Label>
                          <Input value={productImage} onChange={(e) => setProductImage(e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={productAvailable} onCheckedChange={setProductAvailable} />
                          <Label>Available for sale</Label>
                        </div>
                        <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSaveProduct}>
                          {editingProduct ? 'Update Product' : 'Add Product'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Product</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Category</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Price</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Stock</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => (
                        <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                                {product.image_url ? (
                                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                                )}
                              </div>
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{product.categories?.name || '-'}</td>
                          <td className="p-3 font-medium">₹{product.price.toLocaleString()}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateStock(product.id, -1)}>
                                <span className="text-xs">-</span>
                              </Button>
                              <span className={`w-8 text-center ${product.stock_quantity < 5 ? 'text-destructive font-bold' : ''}`}>
                                {product.stock_quantity}
                              </span>
                              <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateStock(product.id, 1)}>
                                <span className="text-xs">+</span>
                              </Button>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={product.is_available ? 'default' : 'secondary'}>
                              {product.is_available ? 'Active' : 'Hidden'}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button size="icon" variant="ghost" onClick={() => openEditDialog(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border border-border rounded-lg">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="font-medium">{order.profiles?.full_name || order.profiles?.email || 'Unknown'}</p>
                          {order.phone && <p className="text-sm text-muted-foreground">{order.phone}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-lg font-bold">₹{Number(order.total_amount).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">Items:</p>
                          <p className="text-sm">
                            {order.order_items.map(item => `${item.product_name} (×${item.quantity})`).join(', ')}
                          </p>
                        </div>
                        <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {order.shipping_address && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Ship to: {order.shipping_address}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
