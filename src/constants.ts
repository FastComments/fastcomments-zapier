export const HOSTS = ['fastcomments.com', 'eu.fastcomments.com'] as const;
export type Host = (typeof HOSTS)[number];
export const DEFAULT_HOST: Host = 'fastcomments.com';

export const HOST_CHOICES: Record<Host, string> = {
  'fastcomments.com': 'United States (fastcomments.com)',
  'eu.fastcomments.com': 'Europe (eu.fastcomments.com)',
};

export function isHost(value: unknown): value is Host {
  return typeof value === 'string' && HOSTS.some((host) => host === value);
}

// The live test lane points the app at a local server; every other request only ever goes to an allowlisted host.
export function baseUrlFor(host: string | undefined): string {
  const override = process.env.FC_ZAPIER_LIVE_BASE_URL;
  if (override) {
    return override.replace(/\/+$/, '');
  }
  return `https://${isHost(host) ? host : DEFAULT_HOST}`;
}

export const SCOPE = 'read write';

export const WEBHOOK_EVENTS = ['comment-created', 'comment-updated', 'comment-deleted'] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const ALL_DOMAINS = '*';

export const LOCALES = [
  'en_us', 'de_de', 'es_es', 'fr_fr', 'it_it', 'ja_jp', 'ko_kr', 'nl_nl', 'pl_pl', 'pt_br', 'ru_ru', 'tr_tr', 'zh_cn', 'zh_tw',
] as const;
