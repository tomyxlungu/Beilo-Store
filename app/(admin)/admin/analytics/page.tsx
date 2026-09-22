'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  Eye,
  ShoppingBag,
  MessageCircle,
  MousePointerClick,
  TrendingUp,
} from 'lucide-react';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const EVENT_TYPES = ['page_view', 'product_view', 'add_to_bag', 'whatsapp_checkout'] as const;
type EventType = (typeof EVENT_TYPES)[number];

interface DayBucket {
  date: string;
  page_view: number;
  product_view: number;
  add_to_bag: number;
  whatsapp_checkout: number;
}

const TYPE_META: Record<EventType, { label: string; icon: any; bg: string; color: string }> = {
  page_view: { label: 'Page Views', icon: Eye, bg: '#dbeafe', color: '#2563eb' },
  product_view: { label: 'Product Views', icon: MousePointerClick, bg: '#ede9fe', color: '#7c3aed' },
  add_to_bag: { label: 'Add to Bag', icon: ShoppingBag, bg: '#fef3c7', color: '#d97706' },
  whatsapp_checkout: { label: 'WhatsApp Checkouts', icon: MessageCircle, bg: '#d1fae5', color: '#059669' },
};

function MultiLineChart({ data }: { data: DayBucket[] }) {
  if (!data.length) {
    return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>No events yet — browse the store to generate data</div>;
  }

  const w = 640;
  const h = 230;
  const padding = { top: 16, right: 16, bottom: 36, left: 44 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const max = Math.max(1, ...data.flatMap((d) => EVENT_TYPES.map((t) => d[t])));
  const denom = data.length > 1 ? data.length - 1 : 1;

  const colors: Record<EventType, string> = {
    page_view: '#2563eb',
    product_view: '#7c3aed',
    add_to_bag: '#d97706',
    whatsapp_checkout: '#059669',
  };

  const paths = EVENT_TYPES.map((t) => {
    const pts = data.map((d, i) => {
      const x = padding.left + (i / denom) * chartW;
      const y = padding.top + chartH - (d[t] / max) * chartH;
      return { x, y };
    });
    return { type: t, d: pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') };
  });

  function shortDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' });
  }

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto' }}>
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = padding.top + chartH - f * chartH;
          return (
            <g key={f}>
              <line x1={padding.left} y1={y} x2={w - padding.right} y2={y} stroke="#eef0f3" strokeWidth={1} />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
                {Math.round(max * f)}
              </text>
            </g>
          );
        })}
        {paths.map((p) => (
          <path key={p.type} d={p.d} fill="none" stroke={colors[p.type]} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {data.map((d, i) => (
          i % Math.max(1, Math.floor(data.length / 7)) === 0 && (
            <text key={d.date} x={padding.left + (i / denom) * chartW} y={h - 10} textAnchor="middle" fontSize={9} fill="#9ca3af">
              {shortDate(d.date)}
            </text>
          )
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '4px 4px 0' }}>
        {EVENT_TYPES.map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
            <span style={{ width: 10, height: 3, borderRadius: 2, background: colors[t] }} />
            {TYPE_META[t].label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Funnel({ counts }: { counts: Record<EventType, number> }) {
  const steps: { type: EventType; rate: string }[] = EVENT_TYPES.map((t, i) => {
    if (i === 0) return { type: t, rate: '100%' };
    const prev = counts[EVENT_TYPES[i - 1]] || 0;
    const cur = counts[t] || 0;
    return { type: t, rate: prev > 0 ? `${((cur / prev) * 100).toFixed(1)}%` : '—' };
  });
  const maxCount = Math.max(1, ...EVENT_TYPES.map((t) => counts[t] || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '6px 22px 22px' }}>
      {steps.map((s, i) => {
        const meta = TYPE_META[s.type];
        const widthPct = Math.max(4, ((counts[s.type] || 0) / maxCount) * 100);
        return (
          <div key={s.type}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--charcoal-noir)' }}>{i + 1}. {meta.label}</span>
              <span style={{ color: '#6b7280' }}>{(counts[s.type] || 0).toLocaleString()} · <strong style={{ color: '#059669' }}>{s.rate}</strong></span>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: '#f3f4f6', overflow: 'hidden' }}>
              <div style={{ width: `${widthPct}%`, height: '100%', borderRadius: 999, background: meta.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalytics() {
  const [counts, setCounts] = useState<Record<EventType, number>>({
    page_view: 0, product_view: 0, add_to_bag: 0, whatsapp_checkout: 0,
  });
  const [daily, setDaily] = useState<DayBucket[]>([]);
  const [topProducts, setTopProducts] = useState<{ id: string; name: string; views: number }[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data: events } = await supabase
        .from('events')
        .select('id, type, session_id, product_id, created_at')
        .order('created_at', { ascending: false })
        .limit(1000);

      const list = events ?? [];
      const next: Record<EventType, number> = { page_view: 0, product_view: 0, add_to_bag: 0, whatsapp_checkout: 0 };
      const sessions = new Set<string>();
      const byDay = new Map<string, DayBucket>();
      const productViews = new Map<string, number>();

      for (const e of list) {
        if (EVENT_TYPES.includes(e.type)) next[e.type as EventType] += 1;
        if (e.session_id) sessions.add(e.session_id);
        const day = e.created_at?.split('T')[0];
        if (day) {
          if (!byDay.has(day)) byDay.set(day, { date: day, page_view: 0, product_view: 0, add_to_bag: 0, whatsapp_checkout: 0 });
          const bucket = byDay.get(day)!;
          if (EVENT_TYPES.includes(e.type)) bucket[e.type as EventType] += 1;
        }
        if (e.type === 'product_view' && e.product_id) {
          productViews.set(e.product_id, (productViews.get(e.product_id) || 0) + 1);
        }
      }

      setCounts(next);
      setUniqueSessions(sessions.size);
      setDaily(Array.from(byDay.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-14));

      const topIds = Array.from(productViews.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (topIds.length) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .in('id', topIds.map(([id]) => id));
        const nameById = new Map((products ?? []).map((p: any) => [p.id, p.name]));
        setTopProducts(topIds.map(([id, views]) => ({
          id,
          name: nameById.get(id) || id.slice(0, 8),
          views,
        })));
      } else {
        setTopProducts([]);
      }

      const { data: recent } = await supabase
        .from('events')
        .select('id, type, session_id, product_id, created_at, products(name)')
        .order('created_at', { ascending: false })
        .limit(10);
      setRecentEvents(recent ?? []);
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-kpi-grid">
        {EVENT_TYPES.map((t) => {
          const meta = TYPE_META[t];
          return (
            <div key={t} className="admin-kpi-card">
              <div className="admin-kpi-top">
                <div className="admin-kpi-icon" style={{ background: meta.bg, color: meta.color }}>
                  <meta.icon size={20} />
                </div>
                <p className="admin-kpi-trend up">
                  <TrendingUp size={12} />
                  {uniqueSessions > 0 ? `${(counts[t] / uniqueSessions).toFixed(1)}/session` : '—'}
                </p>
              </div>
              <p className="admin-kpi-label">{meta.label}</p>
              <p className="admin-kpi-value">{counts[t].toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      <div className="admin-dashboard-mid">
        <div className="admin-card admin-sales-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title admin-card-title-upper">Events — last 14 days</h3>
              <p className="admin-card-subtitle">{uniqueSessions.toLocaleString()} <span className="admin-card-trend up">unique sessions</span></p>
              <p className="admin-card-vs">All tracked storefront events</p>
            </div>
          </div>
          <div className="admin-sales-chart">
            <MultiLineChart data={daily} />
          </div>
        </div>

        <div className="admin-card admin-inventory-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title"><span className="admin-dot admin-dot-orange" />Top Viewed Products</h3>
          </div>
          <div className="admin-inventory-list">
            {topProducts.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No product views tracked yet</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.id} className="admin-inventory-item">
                  <span className="admin-rank" style={{ position: 'static' }}>#{i + 1}</span>
                  <div className="admin-inventory-info">
                    <span className="admin-inventory-name">{p.name}</span>
                    <span className="admin-inventory-sku">{p.views} views</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="admin-dashboard-bottom">
        <div className="admin-card admin-orders-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Conversion Funnel</h3>
              <p className="admin-card-sub">Page view → product view → bag → checkout</p>
            </div>
          </div>
          <Funnel counts={counts} />
        </div>

        <div className="admin-card admin-segments-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Events</h3>
            <span className="admin-card-badge">{recentEvents.length} latest</span>
          </div>
          <div className="admin-inventory-list">
            {recentEvents.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No events yet</p>
            ) : (
              recentEvents.map((e: any) => (
                <div key={e.id} className="admin-inventory-item">
                  <div className="admin-inventory-info">
                    <span className="admin-inventory-name">{e.type.replace(/_/g, ' ')}</span>
                    <span className="admin-inventory-sku">
                      {(e.products as any)?.name || e.session_id?.slice(0, 8) || ''} · {e.created_at ? new Date(e.created_at).toLocaleString('en-ZM', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
