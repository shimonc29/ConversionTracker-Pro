import { z } from 'zod';

// UTM and traffic source parameters schema
const TrafficSourceSchema = z.object({
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_term: z.string().optional(),
  utm_content: z.string().optional(),
  referrer: z.string().optional(),
  referrer_domain: z.string().optional(),
  search_engine: z.string().optional(),
  search_query: z.string().optional(),
  social_network: z.string().optional(),
  ad_platform: z.string().optional(),
  ad_campaign: z.string().optional(),
  ad_group: z.string().optional(),
  ad_keyword: z.string().optional(),
}).optional();

// Enhanced event data schema
const EventDataSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  screen: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  viewport: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  // Conversion specific data
  value: z.number().optional(),
  currency: z.string().optional(),
  conversionType: z.string().optional(),
  // UTM and traffic source data
  trafficSource: TrafficSourceSchema,
  // Custom data
  customData: z.record(z.any()).optional(),
}).passthrough(); // Allow additional fields

export const EventSchema = z.object({
  eventId: z.string(),
  siteId: z.string(),
  type: z.enum(['page_view', 'custom', 'conversion']),
  data: EventDataSchema,
  clientTimestamp: z.string(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export function validateEvent(event: unknown) {
  return EventSchema.safeParse(event);
}

export function validateBatch(events: unknown[]): any[] {
  if (!Array.isArray(events)) return [];
  return events
    .map(validateEvent)
    .filter((r) => r.success)
    .map((r) => r.data);
}

// Helper function to extract UTM parameters from URL
export function extractUTMParameters(url: string) {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
    };
  } catch {
    return {};
  }
}

// Helper function to extract referrer information
export function extractReferrerInfo(referrer: string) {
  try {
    const referrerUrl = new URL(referrer);
    return {
      referrer_domain: referrerUrl.hostname,
      search_engine: getSearchEngine(referrerUrl.hostname),
      search_query: referrerUrl.searchParams.get('q') || undefined,
      social_network: getSocialNetwork(referrerUrl.hostname),
    };
  } catch {
    return {};
  }
}

function getSearchEngine(hostname: string): string | undefined {
  const searchEngines = {
    'google.com': 'google',
    'bing.com': 'bing',
    'yahoo.com': 'yahoo',
    'duckduckgo.com': 'duckduckgo',
    'yandex.com': 'yandex',
  };
  return searchEngines[hostname as keyof typeof searchEngines];
}

function getSocialNetwork(hostname: string): string | undefined {
  const socialNetworks = {
    'facebook.com': 'facebook',
    'twitter.com': 'twitter',
    'linkedin.com': 'linkedin',
    'instagram.com': 'instagram',
    'youtube.com': 'youtube',
    'tiktok.com': 'tiktok',
    'reddit.com': 'reddit',
  };
  return socialNetworks[hostname as keyof typeof socialNetworks];
}
