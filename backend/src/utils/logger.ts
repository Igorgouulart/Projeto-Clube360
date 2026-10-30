const isProd = process.env.NODE_ENV === 'production';

export const logger = {
  info: (msg: string, data?: unknown) => {
    if (isProd) {
      console.log(JSON.stringify({ level: 'info', msg, data, ts: new Date().toISOString() }));
    } else {
      console.log(`[INFO] ${msg}`, data ?? '');
    }
  },
  error: (msg: string, error?: unknown) => {
    if (isProd) {
      console.error(JSON.stringify({ level: 'error', msg, error: String(error), ts: new Date().toISOString() }));
    } else {
      console.error(`[ERROR] ${msg}`, error ?? '');
    }
  },
  warn: (msg: string, data?: unknown) => {
    console.warn(`[WARN] ${msg}`, data ?? '');
  },
};
