import { Suspense } from 'react';
import { Comfortaa } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { SiteHeader, SiteFooter } from '@/components/layout/SiteChrome';
import { CartProvider } from '@/lib/cart-context';
import { WishlistProvider } from '@/lib/wishlist-context';

/*
 * Static fallbacks for streaming brand chrome. They must NOT use
 * navigation hooks (useSearchParams/usePathname) — fallbacks render
 * outside the Suspense boundary during prerender, and any such hook
 * fails the production build (missing-suspense-with-csr-bailout).
 */
function HeaderFallback() {
  return (
    <header className="header" aria-hidden="true">
      <div className="header-inner">
        <span className="header-logo">
          <span>BEILO</span>
        </span>
      </div>
    </header>
  );
}

function FooterFallback() {
  return (
    <footer className="footer" aria-hidden="true">
      <div className="footer-container">
        <p className="footer-copy">© BEILO</p>
      </div>
    </footer>
  );
}

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
             * Brand chrome streams in via Suspense: the page shell
             * (and CDN/static rendering) is never blocked on a
             * Supabase round-trip. Fallbacks match the defaults so
             * there is no layout shift when settings resolve.
             * Header also reads search params, hence the boundary.
             */}
            <Suspense fallback={<HeaderFallback />}>
              <SiteHeader />
            </Suspense>
            <main className="main-content">
              {children}
            </main>
            <Suspense fallback={<FooterFallback />}>
              <SiteFooter />
            </Suspense>
            <Analytics />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
