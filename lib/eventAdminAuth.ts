export const EVENT_ADMIN_EMAIL = 'etkinlikkavunla';
export const EVENT_ADMIN_PASSWORD = 'kavunlaetkinlik';
export const EVENT_ADMIN_COOKIE_NAME = 'eventAdminToken';
export const EVENT_ADMIN_COOKIE_VALUE = 'kavunla-event-admin';

export const isValidEventAdminCredentials = (email?: string | null, password?: string | null) =>
  email === EVENT_ADMIN_EMAIL && password === EVENT_ADMIN_PASSWORD;

export const isValidEventAdminToken = (token?: string) => token === EVENT_ADMIN_COOKIE_VALUE;
