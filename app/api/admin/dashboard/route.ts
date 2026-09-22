import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, supabaseAdmin } from '@/lib/api/admin-auth';

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const storeFilter = user.role === 'STORE_STAFF' && user.storeId
      ? { column: 'pickup_store_id', value: user.storeId }
      : null;

    // Products count
    const { count: productsCount } = await supabaseAdmin()
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Orders count
    let ordersQuery = supabaseAdmin().from('orders').select('*', { count: 'exact', head: true });
    if (storeFilter) ordersQuery = ordersQuery.eq(storeFilter.column, storeFilter.value);
    const { count: ordersCount } = await ordersQuery;

    // Revenue (last 50 orders)
    let revenueQuery = supabaseAdmin().from('orders').select('total_minor, created_at');
    if (storeFilter) revenueQuery = revenueQuery.eq(storeFilter.column, storeFilter.value);
    const { data: recentOrders } = await revenueQuery
      .order('created_at', { ascending: false })
      .limit(50);

    const totalRevenue = recentOrders?.reduce((sum, o) => sum + (o.total_minor || 0), 0) || 0;

    // Recent orders (5)
    let recentQuery = supabaseAdmin()
      .from('orders')
      .select('id, code, customer_name, customer_phone, total_minor, status, created_at, stores!inner(name)');
    if (storeFilter) recentQuery = recentQuery.eq(storeFilter.column, storeFilter.value);
    const { data: recentOrdersData } = await recentQuery
      .order('created_at', { ascending: false })
      .limit(5);

    // Low stock (5 unique products)
    let stockQuery = supabaseAdmin()
      .from('stock_levels')
      .select('quantity, variant_id, variants!inner(id, product_id, size, colour, products!inner(id, name, low_stock_threshold))')
      .lte('quantity', 10)
      .order('quantity', { ascending: true })
      .limit(20);

    if (storeFilter) stockQuery = stockQuery.eq('store_id', storeFilter.value);

    const { data: lowStockData } = await stockQuery;

    const seen = new Set<string>();
    const lowStockItems = (lowStockData ?? [])
      .filter((sl: any) => {
        const pid = sl.variants?.products?.id;
        if (!pid || sl.quantity > (sl.variants?.products?.low_stock_threshold ?? 5)) return false;
        if (seen.has(pid)) return false;
        seen.add(pid);
        return true;
      })
      .slice(0, 5)
      .map((sl: any) => ({
        id: sl.variants?.products?.id,
        name: sl.variants?.products?.name,
        category: sl.variants?.size + ' · ' + sl.variants?.colour,
        quantity: sl.quantity,
      }));

    // Active staff count
    const { count: staffCount } = await supabaseAdmin()
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    return NextResponse.json({
      stats: {
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        activeStaff: staffCount || 0,
      },
      recentOrders: (recentOrdersData ?? []).map((o: any) => ({
        ...o,
        store_name: o.stores?.name ?? 'Unknown',
      })),
      lowStockProducts: lowStockItems,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
