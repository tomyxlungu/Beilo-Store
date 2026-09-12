// lib/preferences.ts

export interface Profile {
  name: string;
  phone: string;
}

const PROFILE_KEY = 'beilo-profile';
const STORE_KEY = 'beilo-default-store';
const UPDATES_KEY = 'beilo-order-updates';

export function getProfile(): Profile {
  if (typeof window === 'undefined')
    return { name: '', phone: '' };

  try {
    const saved =
      window.localStorage.getItem(PROFILE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      name:
        typeof parsed.name === 'string'
          ? parsed.name
          : '',
      phone:
        typeof parsed.phone === 'string'
          ? parsed.phone
          : '',
    };
  } catch {
    return { name: '', phone: '' };
  }
}

export function saveProfile(profile: Profile) {
  try {
    window.localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(profile)
    );
  } catch {
    /* ignore */
  }
}

export function getDefaultStore(): string {
  if (typeof window === 'undefined') return '';

  try {
    return (
      window.localStorage.getItem(STORE_KEY) ?? ''
    );
  } catch {
    return '';
  }
}

export function saveDefaultStore(store: string) {
  try {
    if (store) {
      window.localStorage.setItem(STORE_KEY, store);
    } else {
      window.localStorage.removeItem(STORE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function getOrderUpdates(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const saved =
      window.localStorage.getItem(UPDATES_KEY);
    return saved === null ? true : saved === '1';
  } catch {
    return true;
  }
}

export function saveOrderUpdates(enabled: boolean) {
  try {
    window.localStorage.setItem(
      UPDATES_KEY,
      enabled ? '1' : '0'
    );
  } catch {
    /* ignore */
  }
}
