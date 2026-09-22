import axios from 'axios';
import https from 'node:https';
import { XMLParser } from 'fast-xml-parser';
import type { EmergencyAlert, EmergencyLevel } from './interfaces.js';

const NEWSDATA_LATEST_URL = 'https://newsdata.io/api/1/latest';
const RSS_HTTPS_AGENT = new https.Agent({ rejectUnauthorized: false });

const GOOGLE_NEWS_QUERIES = [
  'Guatemala (accidente OR emergencia OR rescate OR ayuda OR incendio OR sismo OR terremoto OR derrumbe OR deslizamiento OR inundacion OR desaparecido OR heridos OR bomberos OR CONRED OR INSIVUMEH) when:1d',
  'Guatemala (transito OR colision OR choque OR ruta OR carretera OR derrumbe OR inundacion OR accidente) when:1d',
  'Guatemala (site:conred.gob.gt OR site:insivumeh.gob.gt OR site:agn.gt) (alerta OR emergencia OR lluvia OR sismo OR volcan OR incendio) when:7d'
];

const GOOGLE_NEWS_RSS_URLS = GOOGLE_NEWS_QUERIES.map((query) => (
  `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es-419&gl=GT&ceid=GT:es-419`
));

const TRUSTED_SOURCE_PATTERNS = [
  /conred/i,
  /insivumeh/i,
  /agencia guatemalteca de noticias/i,
  /\bagn\b/i,
  /bomberos/i,
  /prensa libre/i,
  /emisoras unidas/i,
  /soy502/i,
  /la hora/i,
  /publinews/i,
  /guatemala\.com/i,
  /republica/i
];

interface NewsDataArticle {
  article_id?: string;
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string | null;
  source_name?: string;
  image_url?: string | null;
  category?: string[];
}

interface NewsDataResponse {
  status: string;
  results?: NewsDataArticle[];
  message?: string;
}

interface RssSource {
  '#text'?: string;
  '@_url'?: string;
}

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  description?: string;
  source?: string | RssSource;
}

interface RssFeed {
  rss?: {
    channel?: {
      item?: RssItem | RssItem[];
    };
  };
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function classifyIncident(text: string): EmergencyLevel | undefined {
  const normalized = normalizeText(text);

  if (/\b(ayuda|auxilio|solicitan apoyo|piden apoyo|piden ayuda|necesitan ayuda|albergue|donacion|donaciones)\b/.test(normalized)) return 'AYUDA';
  if (/\b(rescate|rescatan|evacuacion|evacuan|busqueda|desaparecid[oa]s?)\b/.test(normalized)) return 'RESCATE';
  if (/\b(accidente|colision|choque|vuelco|atropellad[oa]s?|herid[oa]s?|fallecid[oa]s?)\b/.test(normalized)) return 'ACCIDENTE';
  if (/\b(incendio|llamas|fuego|forestal)\b/.test(normalized)) return 'INCENDIO';
  if (/\b(sismo|temblor|terremoto)\b/.test(normalized)) return 'SISMO';
  if (/\b(inundacion|desborde|anegad[oa]|crecida)\b/.test(normalized)) return 'INUNDACION';
  if (/\b(derrumbe|deslizamiento|alud|hundimiento)\b/.test(normalized)) return 'DERRUMBE';
  if (/\b(transito|trafico|ruta|carretera|bloqueo|paso cerrado|km\s?\d+)\b/.test(normalized)) return 'TRANSITO';
  if (/\b(lluvia|tormenta|huracan|depresion tropical|volcan|ceniza|lahar|clima)\b/.test(normalized)) return 'CLIMA';
  if (/\b(alerta|prevencion|conred|insivumeh|boletin|recomendacion)\b/.test(normalized)) return 'PREVENCION';

  return undefined;
}

function isTrustedSource(source?: string): boolean {
  return TRUSTED_SOURCE_PATTERNS.some((pattern) => pattern.test(source ?? ''));
}

function normalizeDate(value?: string): string {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = new Date(value.includes('T') ? value : value.replace(' ', 'T'));

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function stripHtml(value?: string): string | undefined {
  const cleaned = value
    ?.replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || undefined;
}

function setOptionalFields(
  alert: EmergencyAlert,
  fields: {
    description?: string | undefined;
    url?: string | undefined;
    imageUrl?: string | undefined;
  }
) {
  if (fields.description) alert.description = fields.description;
  if (fields.url) alert.url = fields.url;
  if (fields.imageUrl) alert.imageUrl = fields.imageUrl;
}

function buildAlert(params: {
  id: string;
  title: string;
  description?: string;
  source: string;
  createdAt: string;
  url?: string;
  imageUrl?: string;
}): EmergencyAlert | undefined {
  const level = classifyIncident([params.title, params.description, params.source].filter(Boolean).join(' '));

  if (!level) {
    return undefined;
  }

  const trusted = isTrustedSource(params.source);
  const critical = ['AYUDA', 'RESCATE', 'ACCIDENTE', 'INCENDIO', 'SISMO', 'INUNDACION', 'DERRUMBE'].includes(level);

  if (!trusted && !critical) {
    return undefined;
  }

  const alert: EmergencyAlert = {
    id: params.id,
    level,
    title: params.title,
    source: params.source,
    location: 'Guatemala',
    createdAt: params.createdAt,
    isUnread: Date.now() - new Date(params.createdAt).getTime() < 60 * 60 * 1000
  };

  setOptionalFields(alert, {
    description: params.description,
    url: params.url,
    imageUrl: params.imageUrl
  });

  return alert;
}

function newsDataToAlert(article: NewsDataArticle, index: number): EmergencyAlert | undefined {
  const description = stripHtml(article.description ?? undefined);

  return buildAlert({
    id: article.article_id ?? `newsdata-${index}`,
    title: article.title?.trim() || 'Noticia sin titulo',
    description,
    source: article.source_name ?? 'NewsData.io',
    createdAt: normalizeDate(article.pubDate),
    url: article.link,
    imageUrl: article.image_url ?? undefined
  });
}

function rssSourceName(source?: string | RssSource): string {
  if (!source) return 'Google News';
  if (typeof source === 'string') return source;

  return source['#text'] ?? 'Google News';
}

function rssToAlert(item: RssItem, index: number): EmergencyAlert | undefined {
  const description = stripHtml(item.description);

  return buildAlert({
    id: item.link ?? `rss-${index}`,
    title: item.title?.trim() || 'Noticia sin titulo',
    description,
    source: rssSourceName(item.source),
    createdAt: normalizeDate(item.pubDate),
    url: item.link
  });
}

async function fetchNewsDataAlerts(apiKey?: string): Promise<EmergencyAlert[]> {
  if (!apiKey || apiKey === 'TU_API_KEY') {
    return [];
  }

  const response = await axios.get<NewsDataResponse>(NEWSDATA_LATEST_URL, {
    params: {
      apikey: apiKey,
      country: 'gt',
      language: 'es',
      q: 'accidente OR emergencia OR rescate OR ayuda OR incendio OR sismo OR derrumbe OR inundacion OR bomberos OR conred OR insivumeh',
      size: 10
    },
    timeout: 10000
  });

  if (response.data.status !== 'success') {
    throw new Error(response.data.message ?? 'NewsData API retorno un estado de fallo');
  }

  return (response.data.results ?? [])
    .map(newsDataToAlert)
    .filter((alert): alert is EmergencyAlert => Boolean(alert));
}

async function fetchGoogleNewsAlerts(): Promise<EmergencyAlert[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    textNodeName: '#text'
  });

  const feeds = await Promise.allSettled(
    GOOGLE_NEWS_RSS_URLS.map(async (url) => {
      const response = await axios.get<string>(url, {
        httpsAgent: RSS_HTTPS_AGENT,
        responseType: 'text',
        timeout: 15000,
        headers: {
          'User-Agent': 'OFFLINEAID/1.0'
        }
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Google News RSS respondio ${response.status}`);
      }

      return parser.parse(response.data) as RssFeed;
    })
  );

  return feeds.flatMap((feed, feedIndex) => {
    if (feed.status !== 'fulfilled') {
      console.error('No se pudo consultar una fuente RSS:', feed.reason);
      return [];
    }

    return asArray(feed.value.rss?.channel?.item)
      .map((item, itemIndex) => rssToAlert(item, feedIndex * 100 + itemIndex))
      .filter((alert): alert is EmergencyAlert => Boolean(alert));
  });
}

function deduplicateAlerts(alerts: EmergencyAlert[]): EmergencyAlert[] {
  const seen = new Set<string>();

  return alerts.filter((alert) => {
    const key = normalizeText(alert.url ?? alert.title);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function fetchGuatemalaAlerts(apiKey?: string): Promise<EmergencyAlert[]> {
  const results = await Promise.allSettled([
    fetchNewsDataAlerts(apiKey),
    fetchGoogleNewsAlerts()
  ]);

  const alerts = results.flatMap((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    console.error('No se pudo consultar una fuente de noticias:', result.reason);
    return [];
  });

  if (alerts.length === 0) {
    throw new Error('No se encontraron incidentes recientes de Guatemala. Revisa tu conexion o intenta de nuevo en unos minutos.');
  }

  return deduplicateAlerts(alerts)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);
}
