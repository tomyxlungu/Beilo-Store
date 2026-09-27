// lib/ready-time.ts — dynamic pickup/delivery estimate (Pilot item 27).

export type DeliveryMethod = 'pickup' | 'delivery';

export function getReadyTimeEstimate(opts: {
  method: DeliveryMethod;
  itemCount?: number;
  now?: Date;
}): { label: string; detail: string } {
  const now = opts.now ?? new Date();
  const hour = now.getHours();
  const itemCount = opts.itemCount ?? 1;

  if (opts.method === 'pickup') {
    // Before 16:00 → ready in ~2h today, else tomorrow 10AM.
    // +30min per 3 items over 3 (packing time).
    const extra = itemCount > 3 ? Math.ceil((itemCount - 3) / 3) * 30 : 0;
    if (hour < 16) {
      const mins = 120 + extra;
      const ready = new Date(now.getTime() + mins * 60000);
      const time = ready.toLocaleTimeString('en-ZM', { hour: 'numeric', minute: '2-digit' });
      return {
        label: `Ready for pickup today ~${time}`,
        detail: `Packed in ~${mins} min (${itemCount} item${itemCount === 1 ? '' : 's'}). We'll WhatsApp you.`,
      };
    }
    return {
      label: 'Ready for pickup tomorrow 10AM',
      detail: `Ordered after 4PM — packed first thing (${itemCount} item${itemCount === 1 ? '' : 's'}).`,
    };
  }

  // Delivery: Lusaka 1–2 working days, +1 day for big bags.
  const days = itemCount > 5 ? '2–3 working days' : '1–2 working days';
  return {
    label: `Delivery in ${days}`,
    detail: 'Lusaka K50 · countrywide on request. Rider confirms on WhatsApp.',
  };
}
