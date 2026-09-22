'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
} from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: 'Processing', color: '#d97706', bg: '#fef3c7' },
  CONFIRMED: { label: 'Confirmed', color: '#2563eb', bg: '#dbeafe' },
  READY_FOR_PICKUP: { label: 'Ready', color: '#7c3aed', bg: '#ede9fe' },
  COMPLETED: { label: 'Delivered', color: '#059669', bg: '#d1fae5' },
  CANCELLED: { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2' },
};

function formatCurrency(ngwee: number): string {
  const kwacha = ngwee / 100;
  return 'K ' + kwacha.toLocaleString('en-ZM', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatCurrencyFull(ngwee: number): string {
  const kwacha = ngwee / 100;
  return 'K ' + kwacha.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZM', { month: 'short', day: 'numeric', year: 'numeric' });
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 40;
  const w = 120;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

function SalesChart({ data }: { data: { date: string; total: number }[] }) {
  if (!data.length) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ironclad-grey)' }}>No sales data</div>;

  const totals = data.map((d) => (Number.isFinite(d.total) ? d.total : 0));
  const rawMax = Math.max(...totals);
  const max = rawMax > 0 ? rawMax : 1;
  const w = 600;
  const h = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const denom = data.length > 1 ? data.length - 1 : 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / denom) * chartW;
    const total = Number.isFinite(d.total) ? d.total : 0;
    const y = padding.top + chartH - (total / max) * chartH;
    return { x, y, ...d, total };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const ticks = 5;
  const yTicks = Array.from({ length: ticks }, (_, i) => {
    const val = (max / ticks) * (i + 1);
    const y = padding.top + chartH - (val / max) * chartH;
    return { val, y };
  });

  const peak = points.reduce((a, b) => (b.total > a.total ? b : a), points[0]);
  const peakDate = new Date(peak.date);
  const peakValid = !isNaN(peakDate.getTime());
  const peakLabel = peakValid ? peakDate.toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' }).toUpperCase() : '';
  const peakKwacha = peak.total / 100;
  const peakValueLabel = peakKwacha >= 1000 ? `$${(peakKwacha / 1000).toFixed(2)}` : `$${peakKwacha.toFixed(0)}`;
  const peakX = Number.isFinite(peak.x) ? peak.x : padding.left;
  const peakY = Number.isFinite(peak.y) ? peak.y : padding.top + chartH;

  function shortDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' });
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F766E" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0F766E" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padding.left} y1={t.y} x2={w - padding.right} y2={t.y} stroke="#E0E0E0" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x={padding.left - 8} y={t.y + 4} textAnchor="end" fontSize="10" fill="#565656">
            {t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}K` : t.val.toFixed(0)}
          </text>
        </g>
      ))}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#0F766E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={peakX} cy={peakY} r={4.5} fill="#0F766E" stroke="#fff" strokeWidth={2} />
      <g transform={`translate(${Math.min(Math.max(peakX - 34, 4), w - 76)}, ${Math.max(peakY - 52, 0)})`}>
        <rect width={72} height={38} rx={8} fill="#1f2937" />
        <text x={36} y={15} textAnchor="middle" fontSize={8} fill="#9ca3af" fontWeight={600}>{peakLabel}</text>
        <text x={36} y={30} textAnchor="middle" fontSize={11} fill="#fff" fontWeight={700}>{peakValueLabel}</text>
      </g>
      {points.map((p, i) => (
        i % Math.max(1, Math.floor(data.length / 6)) === 0 && (
          <text key={i} x={Number.isFinite(p.x) ? p.x : 0} y={h - 8} textAnchor="middle" fontSize="9" fill="#565656">
            {shortDate(p.date)}
          </text>
        )
      ))}
    </svg>
  );
}

function DonutChart({ segments, total }: { segments: { label: string; value: number; color: string }[]; total: number }) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 65;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="donut-wrap">
      <div className="donut-chart">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => {
            const pct = total > 0 ? seg.value / total : 0;
            const dashLen = pct * circumference;
            const dashOffset = -cumulative * circumference;
            cumulative += pct;
            return (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
          })}
        </svg>
        <div className="donut-center">
          <span className="donut-total">{total.toLocaleString()}</span>
          <span className="donut-total-label">Total</span>
        </div>
      </div>
      <div className="donut-legend">
        {segments.map((seg, i) => (
          <div key={i} className="donut-legend-item">
            <div className="donut-legend-label">
              <span className="donut-dot" style={{ background: seg.color }} />
              <span>{seg.label}</span>
            </div>
            <span className="donut-pct">{total > 0 ? Math.round((seg.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, activeStaff: 0, totalCustomers: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<{ date: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { count: productsCount } = await supabase
        .from('products').select('*', { count: 'exact', head: true });

      const { count: ordersCount } = await supabase
        .from('orders').select('*', { count: 'exact', head: true });

      const { data: orders } = await supabase
        .from('orders').select('total_minor, created_at, status')
        .order('created_at', { ascending: false }).limit(50);

      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_minor || 0), 0) || 0;

      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('id, code, customer_name, total_minor, status, created_at')
        .order('created_at', { ascending: false }).limit(5);

      const { data: lowStockData } = await supabase
        .from('stock_levels')
        .select('quantity, variant_id, variants!inner(id, product_id, size, colour, sku, products!inner(id, name, images, low_stock_threshold))')
        .lte('quantity', 10).order('quantity', { ascending: true }).limit(20);

      const seen = new Set<string>();
      const lowStockItems = (lowStockData ?? [])
        .filter((sl: any) => {
          const pid = sl.variants?.products?.id;
          if (!pid || sl.quantity > (sl.variants?.products?.low_stock_threshold ?? 5)) return false;
          if (seen.has(pid)) return false;
          seen.add(pid);
          return true;
        }).slice(0, 3).map((sl: any) => ({
          id: sl.variants?.products?.id,
          name: sl.variants?.products?.name,
          sku: sl.variants?.sku || `${sl.variants?.size || ''} · ${sl.variants?.colour || ''}`,
          image: sl.variants?.products?.images?.[0] || '/products/cozy.jpeg',
          quantity: sl.quantity,
        }));

      const { count: staffCount } = await supabase
        .from('users').select('*', { count: 'exact', head: true }).eq('active', true);

      const { count: customersCount } = await supabase
        .from('customers').select('*', { count: 'exact', head: true });

      const { data: productImages } = await supabase
        .from('products').select('name, images').limit(100);
      const imageByName = new Map<string, string>();
      for (const p of productImages ?? []) {
        if (p.name && p.images?.[0]) imageByName.set(p.name, p.images[0]);
      }

      // Top products by order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_name, unit_price_minor, quantity')
        .limit(200);

      const productMap = new Map<string, { name: string; units: number; revenue: number; image: string }>();
      for (const item of orderItems ?? []) {
        const existing = productMap.get(item.product_name) || { name: item.product_name, units: 0, revenue: 0, image: imageByName.get(item.product_name) || '/products/cozy.jpeg' };
        existing.units += item.quantity;
        existing.revenue += item.unit_price_minor * item.quantity;
        productMap.set(item.product_name, existing);
      }
      const topProductsList = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      // Sales chart data (group by date, skip rows without a valid date)
      const salesByDate = new Map<string, number>();
      for (const o of orders ?? []) {
        if (!o.created_at) continue;
        const date = o.created_at.split('T')[0];
        if (!date) continue;
        salesByDate.set(date, (salesByDate.get(date) || 0) + (o.total_minor || 0));
      }
      const salesChart = Array.from(salesByDate.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        activeStaff: staffCount || 0,
        totalCustomers: customersCount || 0,
      });
      setRecentOrders(recentOrdersData || []);
      setLowStockProducts(lowStockItems);
      setTopProducts(topProductsList);
      setSalesData(salesChart);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner" />
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), trend: '18.6%', up: true, icon: DollarSign, iconBg: '#d1fae5', iconColor: '#059669' },
    { label: 'Orders', value: stats.totalOrders.toLocaleString(), trend: '12.4%', up: true, icon: ShoppingCart, iconBg: '#dbeafe', iconColor: '#2563eb' },
    { label: 'Customers', value: (stats.totalCustomers || stats.activeStaff).toLocaleString(), trend: '9.2%', up: true, icon: Users, iconBg: '#ede9fe', iconColor: '#7c3aed' },
    { label: 'Conversion Rate', value: '3.42%', trend: '6.7%', up: true, icon: Package, iconBg: '#fef3c7', iconColor: '#d97706' },
  ];

  const totalCust = stats.totalCustomers || 100;
  const customerSegments = [
    { label: 'Returning', value: Math.round(totalCust * 0.45), color: '#2563eb' },
    { label: 'New Customers', value: Math.round(totalCust * 0.35), color: '#059669' },
    { label: 'Loyal (VIP)', value: Math.max(1, totalCust - Math.round(totalCust * 0.45) - Math.round(totalCust * 0.35)), color: '#f59e0b' },
  ];
  const segmentTotal = customerSegments.reduce((s, seg) => s + seg.value, 0);

  return (
    <div className="admin-dashboard">
      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="admin-kpi-card">
            <div className="admin-kpi-top">
              <div className="admin-kpi-icon" style={{ background: kpi.iconBg, color: kpi.iconColor }}>
                <kpi.icon size={20} />
              </div>
              <p className={`admin-kpi-trend ${kpi.up ? 'up' : 'down'}`}>
                {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {kpi.trend}
              </p>
            </div>
            <p className="admin-kpi-label">{kpi.label}</p>
            <p className="admin-kpi-value">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Sales Overview + Inventory Alerts */}
      <div className="admin-dashboard-mid">
        <div className="admin-card admin-sales-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title admin-card-title-upper">Sales Overview</h3>
              <p className="admin-card-subtitle">{formatCurrency(stats.totalRevenue)} <span className="admin-card-trend up">▲ 18.6%</span></p>
              <p className="admin-card-vs">vs May 12 – Apr 11, 2024</p>
            </div>
            <span className="admin-card-badge">Daily ⌄</span>
          </div>
          <div className="admin-sales-chart">
            <SalesChart data={salesData} />
          </div>
        </div>

        <div className="admin-card admin-inventory-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title"><span className="admin-dot admin-dot-orange" />Inventory Alerts</h3>
            <a href="/admin/products" className="admin-card-link">View all &gt;</a>
          </div>
          <div className="admin-inventory-list">
            {lowStockProducts.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: 'var(--ironclad-grey)', fontSize: '13px' }}>All products well stocked</p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="admin-inventory-item">
                  <img src={p.image} alt={p.name} className="admin-inventory-thumb" />
                  <div className="admin-inventory-info">
                    <span className="admin-inventory-name">{p.name}</span>
                    <span className="admin-inventory-sku">SKU: {p.sku}</span>
                  </div>
                  <div className="admin-inventory-right">
                    <span className={`admin-inventory-badge ${p.quantity === 0 ? 'out' : 'low'}`}>
                      {p.quantity} left
                    </span>
                    <span className="admin-inventory-status">{p.quantity <= 12 ? 'Running low' : 'Low stock'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders + Customer Segments */}
      <div className="admin-dashboard-bottom">
        <div className="admin-card admin-orders-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent Orders</h3>
              <p className="admin-card-sub">Latest checkout updates</p>
            </div>
            <a href="/admin/orders" className="admin-card-link">View all</a>
          </div>
          <div className="admin-table-container admin-orders-table">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr><td colSpan={5} className="admin-table-empty">No orders yet</td></tr>
                ) : (
                  recentOrders.map((order) => {
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.NEW;
                    return (
                      <tr key={order.id}>
                        <td className="admin-order-id">#{order.code || order.id.slice(0, 8)}</td>
                        <td>{order.customer_name || 'Guest'}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td style={{ fontWeight: 600 }}>{formatCurrencyFull(order.total_minor)}</td>
                        <td>
                          <span className="admin-status-badge" style={{ background: sc.bg, color: sc.color }}>
                            {sc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="admin-orders-mobile">
            {recentOrders.map((order) => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.NEW;
              const initial = (order.customer_name || 'G').charAt(0).toUpperCase();
              return (
                <div key={order.id} className="admin-order-row">
                  <div className="admin-order-avatar">{initial}</div>
                  <div className="admin-order-info">
                    <span className="admin-order-name">{order.customer_name || 'Guest'}</span>
                    <span className="admin-order-meta">#{order.code || order.id.slice(0, 8)} · {formatDate(order.created_at)}</span>
                  </div>
                  <div className="admin-order-right">
                    <span className="admin-order-amount">{formatCurrencyFull(order.total_minor)}</span>
                    <span className="admin-status-badge" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="admin-card admin-segments-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Customer Segments</h3>
          </div>
          <div className="admin-segments-body">
            <DonutChart segments={customerSegments} total={segmentTotal} />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="admin-card admin-top-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Top Products</h3>
            <p className="admin-card-sub">Best sellers by volume &amp; revenue</p>
          </div>
          <a href="/admin/products" className="admin-card-link">View all</a>
        </div>
        <div className="admin-top-products">
          {topProducts.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--ironclad-grey)', fontSize: '13px' }}>No product data yet</p>
          ) : (
            topProducts.map((p, i) => (
              <div key={i} className="admin-top-product-card">
                <span className="admin-rank">#{i + 1}</span>
                <img src={p.image} alt={p.name} className="admin-top-product-img" />
                <div className="admin-top-product-info">
                  <span className="admin-top-product-name">{p.name}</span>
                  <span className="admin-top-product-meta">{p.units} sold</span>
                  <span className="admin-top-product-revenue">{formatCurrencyFull(p.revenue)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
