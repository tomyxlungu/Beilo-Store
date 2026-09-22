'use client';

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_bag'
  | 'whatsapp_checkout';

const SESSION_KEY = 'beilo-session-id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let sid = window.localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      window.localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return '';
  }
}

export function trackEvent(
  type: AnalyticsEventType,
  opts: { product_id?: string; metadata?: Record<string, any> } = {}
): void {
  if (typeof window === 'undefined') return;
  const session_id = getSessionId();
  if (!session_id) return;

  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      session_id,
      product_id: opts.product_id || null,
      metadata: opts.metadata || {},
    }),
  }).catch(() => {
    /* analytics must never break the storefront */
  });
}
