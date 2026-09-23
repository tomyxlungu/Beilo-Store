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
} from 'lucide-react';
import Input from '@/components/ui/Input';

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
        <div className="admin-page-header">
          <h1>Orders</h1>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Orders</h1>
          <p className="admin-page-subtitle">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchOrders()}
          className="admin-filter-select"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
            className="admin-stat-card"
            style={{
              cursor: 'pointer',
              borderColor: statusFilter === status ? STATUS_COLORS[status] : 'transparent',
            }}
          >
            <div
              className="admin-stat-icon"
              style={{ background: STATUS_COLORS[status] + '15', color: STATUS_COLORS[status] }}
            >
              {status === 'NEW' && <Package size={20} />}
              {status === 'CONFIRMED' && <CheckCircle size={20} />}
              {status === 'READY_FOR_PICKUP' && <Truck size={20} />}
              {status === 'COMPLETED' && <CheckCircle size={20} />}
              {status === 'CANCELLED' && <XCircle size={20} />}
            </div>
            <div className="admin-stat-content">
              <p className="admin-stat-title">{status.replace(/_/g, ' ')}</p>
              <p className="admin-stat-value">{statusCounts[status] || 0}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="admin-products-toolbar">
        <div className="admin-search-filter">
          <Input
            type="search"
            placeholder="Search by name, phone, or order ID..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            icon={<Search size={16} />}
            clearable
            onClear={() => setSearch('')}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table-empty">No orders found</td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <Fragment key={order.id}>
                  <tr>
                    <td className="admin-order-id">{order.code || order.id.slice(0, 8)}</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{order.customer_name || 'Guest'}</div>
                        {order.customer_phone && (
                          <div style={{ fontSize: '12px', color: 'var(--ironclad-grey)' }}>
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
                        style={{
                          background: STATUS_COLORS[order.status] + '15',
                          color: STATUS_COLORS[order.status],
                          border: 'none',
                          borderRadius: '9999px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div>{formatDate(order.created_at)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ironclad-grey)' }}>
                        {formatTime(order.created_at)}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="admin-action-btn"
                        aria-label="View order details"
                      >
                        <Eye size={16} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr>
                      <td colSpan={7} style={{ padding: '16px', background: 'var(--cloud-veil)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Order Info</h4>
                            <div style={{ fontSize: '13px' }}>
                              <div>Code: {order.code}</div>
                              <div>Store: {order.store_name}</div>
                              {order.notes && <div>Notes: {order.notes}</div>}
                              {order.cancel_reason && <div>Cancel reason: {order.cancel_reason}</div>}
                            </div>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Details</h4>
                            <div style={{ fontSize: '13px' }}>
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

      {filteredOrders.length > ITEMS_PER_PAGE && (
        <div className="admin-pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="admin-pagination-btn"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <span className="admin-pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="admin-pagination-btn"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
}
