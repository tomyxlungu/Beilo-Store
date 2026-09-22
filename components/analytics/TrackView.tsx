'use client';

import { useEffect } from 'react';
import { trackEvent, type AnalyticsEventType } from '@/lib/analytics';

interface TrackViewProps {
  type: AnalyticsEventType;
  productId?: string;
  metadata?: Record<string, any>;
}

/**
 * Fire-and-forget view tracking on mount.
 * Render inside any storefront page, e.g.
 *   <TrackView type="page_view" metadata={{ page: 'home' }} />
 *   <TrackView type="product_view" productId={product.id} />
 */
export default function TrackView({ type, productId, metadata }: TrackViewProps) {
  useEffect(() => {
    trackEvent(type, { product_id: productId, metadata });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
