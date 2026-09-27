// lib/whatsapp.ts

export interface WhatsAppOrderItem {
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface WhatsAppOrder {
  items: WhatsAppOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryMethod: 'pickup' | 'delivery';
  pickupStore?: string;
  deliveryAddress?: string;
  storePromo?: string;
  readyTime?: string;
}

const formatK = (value: number) =>
  `K${Math.round(value).toLocaleString()}`;

export function generateWhatsAppMessage(
  order: WhatsAppOrder
): string {
  const itemList = order.items
    .map(
      (item) =>
        `• ${item.name}` +
        (item.size ? `\n  Size: ${item.size}` : '') +
        `\n  Qty: ${item.quantity}` +
        `\n  Price: ${formatK(
          item.price * item.quantity
        )}`
    )
    .join('\n\n');

  let message = `NEW ORDER - BEILO\n\n`;

  message += `Customer: ${order.customerName}\n`;
  message += `Phone: ${order.customerPhone}\n`;

  message += `\nItems:\n${itemList}\n\n`;

  message += `Subtotal: ${formatK(order.subtotal)}\n`;
  message += `Delivery: ${
    order.deliveryFee === 0
      ? 'Free pickup'
      : formatK(order.deliveryFee)
  }\n`;
  message += `Total: ${formatK(order.total)}\n\n`;

  if (order.deliveryMethod === 'pickup') {
    message += `Pickup Store: ${
      order.pickupStore ?? '—'
    }\n`;
  } else {
    message += `Delivery Address: ${
      order.deliveryAddress ?? '—'
    }\n`;
  }

  if (order.storePromo) {
    message += `Store Promo: ${order.storePromo}\n`;
  }
  if (order.readyTime) {
    message += `ETA: ${order.readyTime}\n`;
  }

  message += `\nPlease confirm availability. Thank you!`;

  return message;
}

export function buildWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Fire-and-forget open. NOTE: only call this synchronously inside a
 * click/tap handler — after any `await`, browsers treat window.open
 * as an unsolicited popup and block it. For flows that save first
 * (checkout), open a blank tab in the handler, then assign
 * `popup.location.href = buildWhatsAppUrl(...)` once ready.
 */
export function sendWhatsAppOrder(
  phoneNumber: string,
  message: string
) {
  window.open(
    buildWhatsAppUrl(phoneNumber, message),
    '_blank'
  );
}
