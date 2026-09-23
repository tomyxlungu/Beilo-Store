'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import {
  Eye,
  ShoppingBag,
  MessageCircle,
  MousePointerClick,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

const EVENT_TYPES = ['page_view', 'product_view', 'add_to_bag', 'whatsapp_checkout'] as const;
type EventType = (typeof EVENT_TYPES)[number];

interface DayBucket {
  date: string;
  page_view: number;
  product_view: number;
  add_to_bag: number;
  whatsapp_checkout: number;
}

interface RawEvent {
  id: string;
  type: string;
  session_id: string | null;
  product_id: string | null;
  created_at: string | null;
}

const TYPE_META: Record<EventType, { label: string; short: string; icon: any; bg: string; color: string }> = {
  page_view: { label: 'Page Views', short: 'Views', icon: Eye, bg: '#dbeafe', color: '#2563eb' },
  product_view: { label: 'Product Views', short: 'Products', icon: MousePointerClick, bg: '#ede9fe', color: '#7c3aed' },
  add_to_bag: { label: 'Add to Bag', short: 'Bag', icon: ShoppingBag, bg: '#fef3c7', color: '#d97706' },
  whatsapp_checkout: { label: 'WhatsApp Checkouts', short: 'Checkout', icon: MessageCircle, bg: '#d1fae5', color: '#059669' },
};

const RANGES = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: 'All', days: 0 },
];

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-ZM', { month: 'short', day: 'numeric' });
}

function fullDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-ZM', { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Build a continuous day series (zero-filled) for the last N days. */
function buildSeries(events: RawEvent[], days: number): DayBucket[] {
  const byDay = new Map<string, DayBucket>();
  const get = (date: string): DayBucket => {
    let b = byDay.get(date);
    if (!b) {
      b = { date, page_view: 0, product_view: 0, add_to_bag: 0, whatsapp_checkout: 0 };
      byDay.set(date, b);
    }
    return b;
  };

  for (const e of events) {
    const day = e.created_at?.split('T')[0];
    if (!day) continue;
    if ((EVENT_TYPES as readonly string[]).includes(e.type)) {
      get(day)[e.type as EventType] += 1;
    }
  }

  let start: Date;
  let end: Date;
  if (days > 0) {
    end = new Date();
    start = new Date();
    start.setDate(start.getDate() - (days - 1));
  } else {
    const keys = Array.from(byDay.keys()).sort();
    if (!keys.length) return [];
    start = new Date(keys[0] + 'T00:00:00');
    end = new Date(keys[keys.length - 1] + 'T00:00:00');
  }

  const out: DayBucket[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const iso = toISODate(cursor);
    out.push(byDay.get(iso) ?? { date: iso, page_view: 0, product_view: 0, add_to_bag: 0, whatsapp_checkout: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function InteractiveChart({
  data,
  hidden,
  onToggle,
}: {
  data: DayBucket[];
  hidden: Set<EventType>;
  onToggle: (t: EventType) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const visible = useMemo(
    () => EVENT_TYPES.filter((t) => !hidden.has(t)),
    [hidden]
  );

  const w = 640;
  const h = 240;
  const padding = { top: 16, right: 16, bottom: 36, left: 44 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;
  const denom = data.length > 1 ? data.length - 1 : 1;

  const max = useMemo(() => {
    let m = 0;
    for (const d of data) {
      for (const t of visible) {
        const v = Number.isFinite(d[t]) ? d[t] : 0;
        if (v > m) m = v;
      }
    }
    return Math.max(1, m);
  }, [data, visible]);

  const xOf = (i: number) => padding.left + (i / denom) * chartW;
  const yOf = (v: number) => padding.top + chartH - (v / max) * chartH;

  const paths = useMemo(
    () =>
      visible.map((t) => ({
        type: t,
        d: data
          .map((d, i) => {
            const v = Number.isFinite(d[t]) ? d[t] : 0;
            return `${i === 0 ? 'M' : 'L'} ${xOf(i)} ${yOf(v)}`;
          })
          .join(' '),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, visible, max]
  );

  function onMove(e: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !data.length) return;
    const px = ((e.clientX - rect.left) / rect.width) * w;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < data.length; i++) {
      const dist = Math.abs(xOf(i) - px);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    setHover(best);
  }

  if (!data.length) {
    return <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>No events yet — browse the store to generate data</div>;
  }

  const hovered = hover !== null ? data[hover] : null;
  const tipRows = visible.length;
  const tipH = 30 + tipRows * 18;
  const tipW = 168;
  const tipX = hover !== null ? Math.min(Math.max(xOf(hover) - tipW / 2, 2), w - tipW - 2) : 0;
  const tipY = 4;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', height: 'auto', cursor: 'crosshair', touchAction: 'manipulation' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
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
          <path
            key={p.type}
            d={p.d}
            fill="none"
            stroke={TYPE_META[p.type].color}
            strokeWidth={p.type === 'whatsapp_checkout' ? 2.8 : 2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {hover !== null && (
          <line
            x1={xOf(hover)}
            y1={padding.top}
            x2={xOf(hover)}
            y2={padding.top + chartH}
            stroke="#9ca3af"
            strokeWidth={1}
            strokeDasharray="4,3"
          />
        )}
        {visible.map((t) =>
          hover !== null ? (
            <circle
              key={t}
              cx={xOf(hover)}
              cy={yOf(Number.isFinite(data[hover][t]) ? data[hover][t] : 0)}
              r={4}
              fill={TYPE_META[t].color}
              stroke="#fff"
              strokeWidth={2}
            />
          ) : null
        )}
        {data.map((d, i) => (
          i % Math.max(1, Math.floor(data.length / 7)) === 0 && (
            <text
              key={d.date}
              x={xOf(i)}
              y={h - 10}
              textAnchor="middle"
              fontSize={9}
              fill={hover === i ? '#111827' : '#9ca3af'}
              fontWeight={hover === i ? 700 : 400}
            >
              {shortDate(d.date)}
            </text>
          )
        ))}
        {hovered && (
          <g transform={`translate(${tipX}, ${tipY})`}>
            <rect width={tipW} height={tipH} rx={10} fill="#1f2937" opacity={0.97} />
            <text x={12} y={18} fontSize={10} fill="#9ca3af" fontWeight={700}>
              {fullDate(hovered.date).toUpperCase()}
            </text>
            {visible.map((t, r) => (
              <g key={t} transform={`translate(12, ${30 + r * 18})`}>
                <circle cx={5} cy={-3.5} r={4} fill={TYPE_META[t].color} />
                <text x={16} y={0} fontSize={11} fill="#e5e7eb">
                  {TYPE_META[t].short}: <tspan fontWeight={700} fill="#fff">{hovered[t].toLocaleString()}</tspan>
                </text>
              </g>
            ))}
          </g>
        )}
      </svg>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 4px 0' }}>
        {EVENT_TYPES.map((t) => {
          const off = hidden.has(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggle(t)}
              title={off ? `Show ${TYPE_META[t].label}` : `Hide ${TYPE_META[t].label}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: off ? '#c4c9d1' : '#4b5563',
                background: off ? '#f3f4f6' : '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 999,
                padding: '5px 12px',
                cursor: 'pointer',
                opacity: off ? 0.7 : 1,
              }}
            >
              <span style={{ width: 10, height: 3, borderRadius: 2, background: off ? '#d1d5db' : TYPE_META[t].color }} />
              {TYPE_META[t].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Funnel({ counts }: { counts: Record<EventType, number> }) {
  const [active, setActive] = useState<EventType | null>(null);
  const steps = EVENT_TYPES.map((t, i) => {
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
        const isActive = active === s.type;
        return (
          <div
            key={s.type}
            onMouseEnter={() => setActive(s.type)}
            onMouseLeave={() => setActive(null)}
            onClick={() => setActive(isActive ? null : s.type)}
            style={{
              borderRadius: 10,
              padding: isActive ? 8 : 0,
              background: isActive ? '#f9fafb' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--charcoal-noir)' }}>{i + 1}. {meta.label}</span>
              <span style={{ color: '#6b7280' }}>
                {(counts[s.type] || 0).toLocaleString()} · <strong style={{ color: '#059669' }}>{s.rate}</strong>
              </span>
            </div>
            <div style={{ height: isActive ? 14 : 10, borderRadius: 999, background: '#f3f4f6', overflow: 'hidden', transition: 'height 0.15s' }}>
              <div style={{ width: `${widthPct}%`, height: '100%', borderRadius: 999, background: meta.color }} />
            </div>
            {isActive && (
              <p style={{ fontSize: 12, color: '#6b7280', margin: '6px 0 0' }}>
                {i === 0
                  ? 'Every tracked storefront visit starts here.'
                  : `${s.rate} of ${TYPE_META[EVENT_TYPES[i - 1]].label.toLowerCase()} continued to this step.`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalytics() {
  const [events, setEvents] = useState<RawEvent[]>([]);
  const [topProducts, setTopProducts] = useState<{ id: string; name: string; views: number }[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [rangeDays, setRangeDays] = useState(14);
  const [hidden, setHidden] = useState<Set<EventType>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setRefreshing(true);
      const { data } = await supabase
        .from('events')
        .select('id, type, session_id, product_id, created_at')
        .order('created_at', { ascending: false })
        .limit(2000);
      setEvents((data ?? []) as RawEvent[]);

      const views = new Map<string, number>();
      for (const e of data ?? []) {
        if (e.type === 'product_view' && e.product_id) {
          views.set(e.product_id, (views.get(e.product_id) || 0) + 1);
        }
      }
      const topIds = Array.from(views.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (topIds.length) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name')
          .in('id', topIds.map(([id]) => id));
        const nameById = new Map((products ?? []).map((p: any) => [p.id, p.name]));
        setTopProducts(topIds.map(([id, v]) => ({ id, name: nameById.get(id) || id.slice(0, 8), views: v })));
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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const { counts, uniqueSessions, daily } = useMemo(() => {
    const next: Record<EventType, number> = { page_view: 0, product_view: 0, add_to_bag: 0, whatsapp_checkout: 0 };
    const sessions = new Set<string>();
    for (const e of events) {
      if ((EVENT_TYPES as readonly string[]).includes(e.type)) {
        next[e.type as EventType] += 1;
      }
      if (e.session_id) sessions.add(e.session_id);
    }
    return { counts: next, uniqueSessions: sessions.size, daily: buildSeries(events, rangeDays) };
  }, [events, rangeDays]);

  function toggleSeries(t: EventType) {
    setHidden((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(t)) {
        nextSet.delete(t);
      } else {
        // Keep at least one series visible
        if (nextSet.size < EVENT_TYPES.length - 1) nextSet.add(t);
      }
      return nextSet;
    });
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <div className="spinner" />
      </div>
    );
  }

  const totalEvents = EVENT_TYPES.reduce((s, t) => s + counts[t], 0);

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header" style={{ marginBottom: 0 }}>
        <p className="admin-page-subtitle">
          {totalEvents.toLocaleString()} events · {uniqueSessions.toLocaleString()} sessions
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRangeDays(r.days)}
              className="admin-filter-select"
              style={{
                cursor: 'pointer',
                minWidth: 0,
                fontWeight: (rangeDays === r.days) ? 700 : 500,
                borderColor: (rangeDays === r.days) ? '#0F766E' : undefined,
                color: (rangeDays === r.days) ? '#0F766E' : undefined,
              }}
            >
              {r.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            className="admin-filter-select"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            disabled={refreshing}
          >
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : undefined }} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="admin-kpi-grid">
        {EVENT_TYPES.map((t) => {
          const meta = TYPE_META[t];
          const off = hidden.has(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleSeries(t)}
              title={off ? `Show ${meta.label} on the chart` : `Hide ${meta.label} from the chart`}
              className="admin-kpi-card"
              style={{ cursor: 'pointer', textAlign: 'left', opacity: off ? 0.55 : 1, width: '100%' }}
            >
              <div className="admin-kpi-top">
                <div className="admin-kpi-icon" style={{ background: off ? '#f3f4f6' : meta.bg, color: off ? '#9ca3af' : meta.color }}>
                  <meta.icon size={20} />
                </div>
                <p className="admin-kpi-trend up">
                  <TrendingUp size={12} />
                  {uniqueSessions > 0 ? `${(counts[t] / uniqueSessions).toFixed(1)}/session` : '—'}
                </p>
              </div>
              <p className="admin-kpi-label">{meta.label}</p>
              <p className="admin-kpi-value">{counts[t].toLocaleString()}</p>
            </button>
          );
        })}
      </div>

      <div className="admin-dashboard-mid">
        <div className="admin-card admin-sales-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title admin-card-title-upper">
                Events — {rangeDays === 0 ? 'all time' : `last ${rangeDays} days`}
              </h3>
              <p className="admin-card-subtitle">
                {totalEvents.toLocaleString()} <span className="admin-card-trend up">total events</span>
              </p>
              <p className="admin-card-vs">Hover the chart for daily values · click legend or cards to toggle series</p>
            </div>
          </div>
          <div className="admin-sales-chart">
            <InteractiveChart data={daily} hidden={hidden} onToggle={toggleSeries} />
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
              <p className="admin-card-sub">Page view → product view → bag → checkout · hover a step for detail</p>
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
