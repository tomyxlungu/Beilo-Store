'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Calendar,
  ChevronDown,
  ShoppingBag as BagIcon,
} from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const allNavItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, ownerOnly: false },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, ownerOnly: false, badge: true },
  { href: '/admin/products', label: 'Products', icon: Package, ownerOnly: false },
  { href: '/admin/staff', label: 'Customers', icon: Users, ownerOnly: true },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, ownerOnly: true },
  { href: '/admin/settings', label: 'Settings', icon: Settings, ownerOnly: false },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  const navItems = allNavItems.filter(
    (item) => !item.ownerOnly || userRole === 'OWNER'
  );

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      setSession(session);

      const { data: profile } = await supabase
        .from('users')
        .select('role, name')
        .eq('id', session.user.id)
        .single();
      setUserRole(profile?.role ?? null);
      setUserName(profile?.name || session.user?.email?.split('@')[0] || 'Staff');

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/admin/login');
      } else {
        setSession(session);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, isLoginPage]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--cloud-veil)', borderTopColor: 'var(--charcoal-noir)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!session && !isLoginPage) return null;

  if (isLoginPage) {
    return <div className="admin-layout admin-auth">{children}</div>;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  const activeLabel = navItems.find(n => n.href === pathname)?.label || 'Admin';

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link href="/admin/dashboard" className="admin-logo">
            <span className="admin-logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 10a4 4 0 0 1-8 0"></path>
                <path d="M3.103 6.034h17.794"></path>
                <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path>
              </svg>
            </span>
          </Link>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              <item.icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="admin-nav-badge">24</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item signout" onClick={handleSignOut}>
            <LogOut size={20} strokeWidth={2} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button className="admin-mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <span className="admin-header-logo-mark">
              <BagIcon size={18} strokeWidth={2.5} />
            </span>
            <div className="admin-header-titles">
              <span className="admin-eyebrow">Admin Console</span>
              <h1 className="admin-page-title">{activeLabel}</h1>
            </div>
          </div>
          <div className="admin-header-actions">
            <span className="admin-live-sync"><span className="admin-live-dot" />Live Sync</span>
            <button className="admin-header-icon-btn admin-bell">
              <Bell size={20} />
              <span className="admin-bell-dot" />
            </button>
            <div className="admin-header-avatar">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="admin-subbar">
          <button className="admin-header-date">
            <Calendar size={15} />
            <span>May 12 – Jun 11, 2024</span>
            <ChevronDown size={15} />
          </button>
          <span className="admin-live-sync admin-live-sync-mobile"><span className="admin-live-dot" />Live Sync</span>
        </div>

        <div className="admin-content">
          {children}
        </div>

        <nav className="admin-bottomnav">
          <Link href="/admin/dashboard" className={`admin-bottomnav-item ${pathname === '/admin/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={21} />
            <span>Overview</span>
          </Link>
          <Link href="/admin/orders" className={`admin-bottomnav-item ${pathname === '/admin/orders' ? 'active' : ''}`}>
            <span className="admin-bottomnav-iconwrap">
              <ShoppingBag size={21} />
              <span className="admin-bottomnav-badge">24</span>
            </span>
            <span>Orders</span>
          </Link>
          <Link href="/admin/products" className={`admin-bottomnav-item ${pathname === '/admin/products' ? 'active' : ''}`}>
            <Package size={21} />
            <span>Products</span>
          </Link>
          <Link href="/admin/staff" className={`admin-bottomnav-item ${pathname === '/admin/staff' ? 'active' : ''}`}>
            <Users size={21} />
            <span>Customers</span>
          </Link>
          <button className="admin-bottomnav-item" onClick={() => setSidebarOpen(true)}>
            <Menu size={21} />
            <span>More</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
