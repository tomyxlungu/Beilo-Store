import { Suspense } from 'react';
import { Comfortaa } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';

/*
 * Self-hosted Comfortaa: no render-blocking Google Fonts
 * request, font files served from our own domain.
 */
const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-comfortaa',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={comfortaa.variable}>
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
            <Analytics />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}