import { Suspense } from 'react';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <WishlistProvider>
            {/*
             * Header reads search params for active nav states,
             * so it needs a Suspense boundary for static prerendering.
             */}
            <Suspense>
              <Header />
            </Suspense>
            <main className="main-content">
              {children}
            </main>
            <Footer />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}