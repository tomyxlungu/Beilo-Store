// data/stores.ts
import type { Store } from '@/types/product';

export const stores: Store[] = [
  {
    id: 'downtown',
    name: 'Downtown',
    address: 'Cairo Road, Lusaka',
    hours: 'Mon-Sat: 9AM - 6PM',
    phone: '+260 97 1234567',
    mapUrl: 'https://maps.google.com/?q=Cairo+Road+Lusaka',
  },
  {
    id: 'city-market',
    name: 'City Market',
    address: 'Freedom Way, Lusaka',
    hours: 'Mon-Sat: 8AM - 5PM',
    phone: '+260 96 7654321',
    mapUrl: 'https://maps.google.com/?q=Freedom+Way+Lusaka',
  },
  {
    id: 'manda-hill',
    name: 'Manda Hill',
    address: 'Great East Road, Lusaka',
    hours: 'Mon-Sun: 10AM - 8PM',
    phone: '+260 95 5551234',
    mapUrl: 'https://maps.google.com/?q=Manda+Hill+Shopping+Centre+Lusaka',
  },
  {
    id: 'east-park',
    name: 'East Park',
    address: 'Thabo Mbeki Road, Lusaka',
    hours: 'Mon-Sat: 9AM - 7PM',
    phone: '+260 97 8889999',
    mapUrl: 'https://maps.google.com/?q=East+Park+Mall+Lusaka',
  },
  {
    id: 'levy-junction',
    name: 'Levy Junction',
    address: 'Church Road, Lusaka',
    hours: 'Mon-Sun: 9AM - 6PM',
    phone: '+260 96 4445555',
    mapUrl: 'https://maps.google.com/?q=Levy+Junction+Lusaka',
  },
];