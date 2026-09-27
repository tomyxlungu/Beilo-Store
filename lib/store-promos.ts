// lib/store-promos.ts — frontend-only store promos (Pilot item 25).
// Merges with Supabase stores by id or name, so no DB migration needed yet.

export interface StorePromo {
  storeId?: string;
  storeName?: string;
  label: string;
  detail?: string;
}

const PROMOS: StorePromo[] = [
  { storeId: 'city-market', storeName: 'City Market', label: 'City Market weekend: K200 off 2 polos', detail: 'Show this at pickup — auto-applied in WhatsApp order note.' },
  { storeId: 'downtown', storeName: 'Downtown', label: 'Downtown student Thursdays: 10% off', detail: 'Valid with student ID on Thursdays.' },
  { storeId: 'manda-hill', storeName: 'Manda Hill', label: 'Manda Hill bundle: tee + cap K350', detail: 'Mention bundle at pickup.' },
  { storeId: 'east-park', storeName: 'East Park', label: 'East Park new-drop early access Sat 9AM', detail: 'First hour reserved for in-store pickup orders.' },
  { storeId: 'levy-junction', storeName: 'Levy Junction', label: 'Levy free cap wash with any denim', detail: 'This week only.' },
];

function norm(s?: string) {
  return (s ?? '').trim().toLowerCase();
}

export function getStorePromo(store: { id?: string; name?: string }): StorePromo | undefined {
  const id = norm(store.id);
  const name = norm(store.name);
  return PROMOS.find((p) => (p.storeId && norm(p.storeId) === id) || (p.storeName && norm(p.storeName) === name));
}

export function getAllStorePromos(): StorePromo[] {
  return PROMOS;
}
