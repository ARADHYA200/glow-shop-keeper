import { Layout } from '@/components/layout/Layout';

export default function TermsOfServicePage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using the Satish Agencies website, you accept and agree to be bound by 
              these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Products and Pricing</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All prices are listed in Indian Rupees (INR) and are subject to change without notice</li>
              <li>We reserve the right to modify or discontinue products without prior notice</li>
              <li>Product images are for illustration purposes and may vary from actual products</li>
              <li>We strive to display accurate pricing but reserve the right to correct any errors</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Orders and Payment</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All orders are subject to availability and confirmation</li>
              <li>We reserve the right to refuse or cancel any order for any reason</li>
              <li>Payment must be made in full before order processing</li>
              <li>We accept various payment methods as displayed during checkout</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Shipping and Delivery</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Delivery times are estimates and may vary based on location</li>
              <li>Risk of loss and title pass to you upon delivery to the carrier</li>
              <li>Please inspect packages upon delivery and report any damage immediately</li>
              <li>Shipping charges are non-refundable unless the return is due to our error</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Returns and Refunds</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Products may be returned within 7 days of delivery if unused and in original packaging</li>
              <li>Defective products will be replaced or refunded at our discretion</li>
              <li>Refunds will be processed within 7-10 business days after receiving the returned item</li>
              <li>Some products may not be eligible for return due to hygiene or safety reasons</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Warranty</h2>
            <p className="text-muted-foreground">
              Products are covered by manufacturer warranty as specified in their documentation. 
              We do not provide additional warranties unless explicitly stated. Please refer to 
              individual product pages for warranty information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. User Accounts</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree to provide accurate and complete information</li>
              <li>We reserve the right to terminate accounts that violate these terms</li>
              <li>You are responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the fullest extent permitted by law, Satish Agencies shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages arising from your 
              use of our services or products.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">9. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground">
              Email: info@satishagencies.com<br />
              Phone: +91 98765 43210<br />
              Address: 123 Electronics Market, Main Road, City - 560001
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
