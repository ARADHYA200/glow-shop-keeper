import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">SA</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Satish Agencies</h3>
                <p className="text-xs text-muted-foreground">Premium Electronics</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for quality home and kitchen electronics since 1995.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                All Products
              </Link>
              <Link to="/categories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Categories
              </Link>
              <Link to="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Track Order
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/orders" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Track Order
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
                +91 98765 43210
              </a>
              <a href="mailto:info@satishagencies.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
                info@satishagencies.com
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Electronics Market, Main Road, City - 560001</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Satish Agencies. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
