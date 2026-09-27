'use client';

import { useEffect, useState, useCallback, Fragment } from 'react';
import { supabaseBrowser as supabase } from '@/lib/supabase/client';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Check,
  X,
  ClipboardList,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = ['NEW', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];

const STATUS_COLORS: Record<string, string> = {
  NEW: '#f59e0b',
  CONFIRMED: '#3b82f6',
  READY_FOR_PICKUP: '#8b5cf6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

interface Order {
  id: string;
  code: string;
  customer_name: string | null;
  customer_phone: string | null;
  total_minor: number;
  pickup_store_id: string;
  store_name: string;
  status: string;
  notes: string | null;
  cancel_reason: string | null;
  created_at: string;
  items?: any[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZM', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-ZM', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(ngwee: number): string {
  const kwacha = ngwee / 100;
  return 'K ' + kwacha.toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, stores!inner(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped = (data ?? []).map((o: any) => ({
        ...o,
        store_name: o.stores?.name ?? 'Unknown',
      }));
      setOrders(mapped);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let filtered = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (o) =>
          (o.customer_name || '').toLowerCase().includes(q) ||
          (o.customer_phone || '').includes(q) ||
          (o.code || '').toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }
    setFilteredOrders(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
  }, [search, statusFilter, orders]);

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  async function updateStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      fetchOrders();
    } catch {
      alert('Failed to update order status');
    }
  }

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="m3-page-head">
          <div>
            <h1 className="m3-headline-medium">Orders</h1>
          </div>
        </div>
        <div className="m3-loading" role="status" aria-label="Loading orders">
          <div className="m3-progress"><span /></div>
          <p className="m3-body-medium m3-on-surface-variant">Loading orders…</p>
        </div>
      </div>
    );
  }

  const statusFilters = ['All', ...STATUS_OPTIONS];

  return (
    <div className="admin-page">
      <div className="m3-page-head">
        <div>
          <h1 className="m3-headline-medium">Orders</h1>
          <p className="m3-body-medium m3-on-surface-variant">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} · tap a status to filter
          </p>
        </div>
        <div className="m3-page-actions">
          <button
            type="button"
            onClick={() => fetchOrders()}
            className="m3-btn m3-btn-tonal"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="m3-status-cards" role="group" aria-label="Filter orders by status">
        {STATUS_OPTIONS.map((status) => {
          const selected = statusFilter === status;
          return (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(selected ? 'All' : status)}
            className={`m3-status-card${selected ? ' is-selected' : ''}`}
            aria-pressed={selected}
          >
            <span
              className="m3-status-icon"
              style={{ background: STATUS_COLORS[status] + '1A', color: STATUS_COLORS[status] }}
            >
              {status === 'NEW' && <Package size={20} />}
              {status === 'CONFIRMED' && <CheckCircle size={20} />}
              {status === 'READY_FOR_PICKUP' && <Truck size={20} />}
              {status === 'COMPLETED' && <CheckCircle size={20} />}
              {status === 'CANCELLED' && <XCircle size={20} />}
            </span>
            <span className="m3-status-text">
              <span className="m3-label-medium m3-on-surface-variant">{status.replace(/_/g, ' ')}</span>
              <span className="m3-title-medium">{statusCounts[status] || 0}</span>
            </span>
            {selected && <Check size={16} className="m3-status-check" aria-hidden="true" />}
          </button>
          );
        })}
      </div>

      <div className="admin-products-toolbar">
        <div className="m3-search" role="search">
          <Search size={20} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name, phone, or order ID…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            aria-label="Search orders"
          />
          {search && (
            <button type="button" className="m3-icon-button" onClick={() => setSearch('')} aria-label="Clear search">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="m3-chip-row" role="group" aria-label="Filter by status">
          {statusFilters.map((s) => {
            const selected = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                className={`m3-filter-chip${selected ? ' is-selected' : ''}`}
                aria-pressed={selected}
                onClick={() => setStatusFilter(s)}
              >
                {selected && <Check size={14} aria-hidden="true" />}
                {s === 'All' ? 'All statuses' : s.replace(/_/g, ' ')}
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-card hide-mobile">
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Store</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th><span className="m3-body-small">Details</span></th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table-empty">
                  <div className="m3-empty">
                    <span className="m3-empty-icon"><ClipboardList size={28} aria-hidden="true" /></span>
                    <p className="m3-title-medium">No orders found</p>
                    <p className="m3-body-medium m3-on-surface-variant">Try a different search or status filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <Fragment key={order.id}>
                  <tr>
                    <td className="admin-order-id">#{order.code || order.id.slice(0, 8)}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{order.customer_name || 'Guest'}</div>
                        {order.customer_phone && (
                          <div className="m3-body-small m3-on-surface-variant">
                            {order.customer_phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{order.store_name || '—'}</td>
                    <td className="admin-product-price">{formatCurrency(order.total_minor)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="m3-status-select"
                        aria-label={`Status for order ${order.code || order.id.slice(0, 8)}`}
                        style={{
                          background: STATUS_COLORS[order.status] + '1A',
                          color: STATUS_COLORS[order.status],
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div>{formatDate(order.created_at)}</div>
                      <div className="m3-body-small m3-on-surface-variant">
                        {formatTime(order.created_at)}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="admin-action-btn"
                        aria-label={expandedOrder === order.id ? 'Hide order details' : 'View order details'}
                        aria-expanded={expandedOrder === order.id}
                      >
                        <Eye size={18} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr>
                      <td colSpan={7} className="m3-detail-cell">
                        <div className="m3-detail-grid">
                          <div>
                            <h4 className="m3-title-small">Order info</h4>
                            <div className="m3-body-medium">
                              <div>Code: {order.code}</div>
                              <div>Store: {order.store_name}</div>
                              {order.notes && <div>Notes: {order.notes}</div>}
                              {order.cancel_reason && <div>Cancel reason: {order.cancel_reason}</div>}
                            </div>
                          </div>
                          <div>
                            <h4 className="m3-title-small">Details</h4>
                            <div className="m3-body-medium">
                              <div>Full ID: {order.id}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>

      <div className="m3-cards-list show-mobile">
        {paginatedOrders.length === 0 ? (
          <div className="admin-card">
            <div className="m3-empty">
              <span className="m3-empty-icon"><ClipboardList size={28} aria-hidden="true" /></span>
              <p className="m3-title-medium">No orders found</p>
              <p className="m3-body-medium m3-on-surface-variant">Try a different search or status filter.</p>
            </div>
          </div>
        ) : (
          paginatedOrders.map((order) => {
            const expanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="m3-row-card is-column">
                <div className="m3-row-top">
                  <div className="m3-row-main">
                    <span className="m3-row-title">#{order.code || order.id.slice(0, 8)}</span>
                    <span className="m3-row-sub">{order.customer_name || 'Guest'}{order.customer_phone ? ` · ${order.customer_phone}` : ''}</span>
                    <span className="m3-row-sub">{formatDate(order.created_at)} · {formatCurrency(order.total_minor)}</span>
                  </div>
                  <button
                    onClick={() => setExpandedOrder(expanded ? null : order.id)}
                    className="admin-action-btn"
                    aria-label={expanded ? 'Hide order details' : 'View order details'}
                    aria-expanded={expanded}
                  >
                    <Eye size={18} strokeWidth={2} />
                  </button>
                </div>
                <div className="m3-row-bottom">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="m3-status-select"
                    aria-label={`Status for order ${order.code || order.id.slice(0, 8)}`}
                    style={{
                      background: STATUS_COLORS[order.status] + '1A',
                      color: STATUS_COLORS[order.status],
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                {expanded && (
                  <div className="m3-detail-grid" style={{ gridTemplateColumns: '1fr', paddingTop: '4px' }}>
                    <div>
                      <h4 className="m3-title-small">Order info</h4>
                      <div className="m3-body-medium">
                        <div>Store: {order.store_name}</div>
                        {order.notes && <div>Notes: {order.notes}</div>}
                        {order.cancel_reason && <div>Cancel reason: {order.cancel_reason}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {filteredOrders.length > ITEMS_PER_PAGE && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="admin-pagination-btn"
            aria-label="Previous page"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <span className="admin-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="admin-pagination-btn"
            aria-label="Next page"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
