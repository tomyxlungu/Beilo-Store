'use client';

import WhatsAppButton from '@/components/ui/WhatsAppButton';
import MainNavbar from '@/components/layout/MainNavbar';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  Menu,
  X,
  Search,
  MapPin,
  User,
  ShoppingBag,
  ChevronDown,
  Package,
  Heart,
  Settings,
  LogOut,
} from 'lucide-react';

import Input from '@/components/ui/Input';
import { useCart } from '@/lib/cart-context';

const navigation = [
  {
    label: 'Shop',
    href: '/shop',
  },
  {
    label: 'New Arrivals',
    href: '/shop?new=true',
  },
  {
    label: 'Men',
    href: '/shop?category=Men',
  },
  {
    label: 'Women',
    href: '/shop?category=Women',
  },
  {
    label: 'Promos',
    href: '/shop?category=Promos',
  },
  {
    label: 'Stores',
    href: '/stores',
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { totalItems, isHydrated } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] =
    useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] =
    useState(false);

  const [selectedLocation, setSelectedLocation] =
    useState('Lusaka');

  const [isScrolled, setIsScrolled] = useState(false);

  /*
   * Detect scrolling so the header can receive
   * the subtle shadow from the BEILO design system.
   */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);

  /*
   * Close dropdowns when clicking outside them.
   */
  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target = event.target as HTMLElement;

      if (!target.closest('[data-header-dropdown]')) {
        setProfileDropdownOpen(false);
        setLocationDropdownOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setLocationDropdownOpen(false);
  };

  const handleSearchSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    closeAllMenus();

    router.push(
      `/shop?search=${encodeURIComponent(query)}`
    );
  };

  const handleNavigation = (href: string) => {
    closeAllMenus();
    router.push(href);
  };

  const isActive = (href: string) => {
    if (href === '/shop') {
      return (
        pathname === '/shop' &&
        searchParams.toString() === ''
      );
    }

    if (href === '/stores') {
      return pathname === '/stores';
    }

    if (pathname !== '/shop') return false;

    const target = new URL(href, 'http://dummy');
    const targetParams = target.searchParams;

    if (targetParams.toString() === '') return false;

    for (const [key, value] of targetParams.entries()) {
      if (searchParams.get(key) !== value) {
        return false;
      }
    }

    return true;
  };

  return (
    <>
      <AnnouncementBar />

      <header
        className={`sticky-header ${
          isScrolled ? 'scrolled' : ''
        }`}
      >
      <div className="header-container">
        <div className="header-inner">

          {/* MOBILE MENU */}
          <button
            type="button"
            className="btn btn-ghost show-mobile"
            aria-label={
              mobileMenuOpen
                ? 'Close navigation'
                : 'Open navigation'
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() =>
              setMobileMenuOpen(
                (open) => !open
              )
            }
          >
            {mobileMenuOpen ? (
              <X
                size={22}
                strokeWidth={2}
              />
            ) : (
              <Menu
                size={22}
                strokeWidth={2}
              />
            )}
          </button>

          {/* BEILO LOGO */}
          <Link
            href="/"
            className="header-logo"
            aria-label="BEILO home"
            onClick={closeAllMenus}
          >
            <span className="beilo-logo-mark">
              <ShoppingBag
                size={29}
                strokeWidth={2.5}
              />
            </span>

            <span>BEILO</span>
          </Link>

          {/* DESKTOP SEARCH */}
          <form
            onSubmit={handleSearchSubmit}
            className="header-search hide-mobile"
            role="search"
          >
            <Input
              type="search"
              placeholder="Search for products, stores and more..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(
                  event.target.value
                )
              }
              icon={<Search size={18} />}
              size="md"
              variant="default"
              clearable
              onClear={() =>
                setSearchQuery('')
              }
              aria-label="Search products, stores and more"
            />
          </form>

          {/* HEADER ACTIONS */}
          <div className="header-actions">

            {/* LOCATION */}
            <div
              className="relative hide-mobile"
              data-header-dropdown
            >
              <button
                type="button"
                className="location-button"
                onClick={() => {
                  setLocationDropdownOpen(
                    (open) => !open
                  );

                  setProfileDropdownOpen(false);
                }}
                aria-expanded={
                  locationDropdownOpen
                }
                aria-haspopup="menu"
              >
                <MapPin
                  size={21}
                  strokeWidth={2}
                />

                <span>
                  {selectedLocation}
                </span>

                <ChevronDown
                  size={17}
                  strokeWidth={2}
                  className={
                    locationDropdownOpen
                      ? 'rotate-180 transition-transform'
                      : 'transition-transform'
                  }
                />
              </button>

              {locationDropdownOpen && (
                <div className="header-dropdown location-dropdown">
                  {[
                    'Lusaka',
                    'Ndola',
                    'Kitwe',
                  ].map((location) => (
                    <button
                      key={location}
                      type="button"
                      className="header-dropdown-item"
                      onClick={() => {
                        setSelectedLocation(
                          location
                        );

                        setLocationDropdownOpen(
                          false
                        );
                      }}
                    >
                      <MapPin size={17} />

                      <span>{location}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ACCOUNT */}
            <div
              className="relative"
              data-header-dropdown
            >
              <button
                type="button"
                className="icon-button"
                aria-label="Account"
                aria-expanded={
                  profileDropdownOpen
                }
                aria-haspopup="menu"
                onClick={() => {
                  setProfileDropdownOpen(
                    (open) => !open
                  );

                  setLocationDropdownOpen(
                    false
                  );
                }}
              >
                <User
                  size={23}
                  strokeWidth={2}
                />
              </button>

              {profileDropdownOpen && (
                <div className="header-dropdown account-dropdown">

                  <div className="account-dropdown-header">
                    <div className="account-avatar">
                      <User size={19} />
                    </div>

                    <div>
                      <p className="account-title">
                        My Account
                      </p>

                      <p className="account-subtitle">
                        Sign in to continue
                      </p>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="header-dropdown-item"
                    onClick={() =>
                      handleNavigation(
                        '/account'
                      )
                    }
                  >
                    <User size={17} />
                    <span>Profile</span>
                  </button>

                  <button
                    type="button"
                    className="header-dropdown-item"
                    onClick={() =>
                      handleNavigation(
                        '/orders'
                      )
                    }
                  >
                    <Package size={17} />
                    <span>Orders</span>
                  </button>

                  <button
                    type="button"
                    className="header-dropdown-item"
                    onClick={() =>
                      handleNavigation(
                        '/wishlist'
                      )
                    }
                  >
                    <Heart size={17} />
                    <span>Wishlist</span>
                  </button>

                  <button
                    type="button"
                    className="header-dropdown-item"
                    onClick={() =>
                      handleNavigation(
                        '/settings'
                      )
                    }
                  >
                    <Settings size={17} />
                    <span>Settings</span>
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="header-dropdown-item logout-item"
                    onClick={() => {
                      console.log(
                        'Sign out'
                      );

                      setProfileDropdownOpen(
                        false
                      );
                    }}
                  >
                    <LogOut size={17} />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>

            {/* CART */}
            <Link
              href="/cart"
              className="cart-button"
              aria-label={`Shopping cart with ${isHydrated ? totalItems : 0} items`}
              suppressHydrationWarning
            >
              <ShoppingBag
                size={24}
                strokeWidth={2}
              />

              {isHydrated && totalItems > 0 && (
                <span className="cart-count">
                  {totalItems > 99
                    ? '99+'
                    : totalItems}
                </span>
              )}
            </Link>

            {/* WHATSAPP */}
            <div className="hide-mobile">
              <WhatsAppButton
                phoneNumber="260XXXXXXXXX"
                message="Hi BEILO, I need some help."
              />
            </div>
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <form
          onSubmit={handleSearchSubmit}
          className="mobile-search show-mobile"
          role="search"
        >
          <Input
            type="search"
            placeholder="Search for products, stores and more..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            icon={<Search size={17} />}
            size="md"
            variant="default"
            clearable
            onClear={() =>
              setSearchQuery('')
            }
            aria-label="Search products, stores and more"
          />
        </form>

        <MainNavbar />

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <div className="mobile-menu show-mobile">
            <nav
              className="mobile-navigation"
              id="mobile-navigation"
              aria-label="Mobile navigation"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-link ${
                    isActive(item.href)
                      ? 'mobile-nav-link-active'
                      : ''
                  }`}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mobile-menu-divider" />

            <button
              type="button"
              className="mobile-menu-link"
              onClick={() =>
                handleNavigation(
                  '/wishlist'
                )
              }
            >
              <Heart size={19} />
              <span>Wishlist</span>
            </button>

            <button
              type="button"
              className="mobile-menu-link"
              onClick={() =>
                handleNavigation(
                  '/orders'
                )
              }
            >
              <Package size={19} />
              <span>Orders</span>
            </button>

            <button
              type="button"
              className="mobile-menu-link"
              onClick={() =>
                handleNavigation(
                  '/account'
                )
              }
            >
              <User size={19} />
              <span>Account</span>
            </button>
          </div>
        )}
      </div>
      </header>
    </>
  );
}