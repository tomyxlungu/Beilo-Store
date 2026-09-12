// data/faqs.ts
import type { FAQItem } from '@/types/product';

export const FAQ_TOPICS = [
  'All',
  'Orders',
  'Delivery',
  'Returns',
  'Payment',
  'Sizing',
  'Stores',
] as const;

export const faqs: FAQItem[] = [
  {
    question: 'How do I place an order?',
    answer:
      'Add items to your bag, head to checkout, and choose pickup or delivery. We will confirm your order on WhatsApp before anything moves.',
    category: 'Orders',
  },
  {
    question: 'How long until my order is ready?',
    answer:
      "Most orders are ready within 2 hours. We'll send you a WhatsApp message when it's ready for pickup.",
    category: 'Orders',
  },
  {
    question: 'Can I reserve an item?',
    answer:
      "Yes! Send your order through the website and we'll hold it for 24 hours at your selected store.",
    category: 'Orders',
  },
  {
    question: 'How do I track my order?',
    answer:
      'Every order gets WhatsApp updates — confirmed, ready, and delivered. No account or tracking number needed.',
    category: 'Orders',
  },
  {
    question: 'Do you deliver?',
    answer:
      'Yes! Delivery available within Lusaka for K50. Free pickup at any of our 5 stores.',
    category: 'Delivery',
  },
  {
    question: 'How fast is countrywide delivery?',
    answer:
      'Deliveries outside Lusaka take 2–5 working days depending on your town. We confirm timelines on WhatsApp before dispatch.',
    category: 'Delivery',
  },
  {
    question: 'Can I return an item?',
    answer:
      'Yes! Return within 7 days with tags attached for a full refund or exchange.',
    category: 'Returns',
  },
  {
    question: 'What if my size does not fit?',
    answer:
      'Swap it at any store within 7 days — unworn, tags on. If your size is out of stock we will refund or find it at another store.',
    category: 'Returns',
  },
  {
    question: 'How do I pay?',
    answer:
      'Pay on pickup at any of our 5 stores. We accept cash, mobile money (MTN & Airtel), and card payments.',
    category: 'Payment',
  },
  {
    question: 'Do you accept mobile money for delivery?',
    answer:
      'Yes. We accept MTN and Airtel Money for both pickup and delivery orders. Payment details are shared when your order is confirmed.',
    category: 'Payment',
  },
  {
    question: 'How do I know my size?',
    answer:
      "Check the size guide on each product page. If unsure, message us on WhatsApp and we'll help you find the right fit.",
    category: 'Sizing',
  },
  {
    question: 'Do your fits run true to size?',
    answer:
      'Yes, most BEILO fits run true to size. Streetwear pieces are cut relaxed — size down for a regular fit.',
    category: 'Sizing',
  },
  {
    question: 'Where are your stores?',
    answer:
      'Find us in Lusaka, Ndola and Kitwe — 5 stores total. See the Stores page for addresses, hours and directions.',
    category: 'Stores',
  },
  {
    question: 'Can I check stock before visiting?',
    answer:
      'Yes. Every product page shows live stock per store, or just WhatsApp us and we will check the shelf for you.',
    category: 'Stores',
  },
];
