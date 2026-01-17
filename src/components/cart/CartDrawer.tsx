import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store';
import { ShoppingBag } from 'lucide-react';

export function CartDrawer() {
  const { isOpen, closeCart, items } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart
          </SheetTitle>
        </SheetHeader>
        <div className="mt-8 flex flex-col items-center justify-center h-[60vh] text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Your cart is empty</p>
          <Button onClick={closeCart} className="mt-4 gradient-primary text-primary-foreground">
            Continue Shopping
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
